'use strict';

const { EventTypes } = require('../common/constants');
const DalaWalletEvent = require('../model/DalaWalletEvent');
const uuid = require('uuid');
const AWS = require('aws-sdk');
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
// const Web3EthAccounts = require('web3-eth-accounts');
const secretsClient = require('serverless-secrets/client');
const secretsPromise = secretsClient.load();

module.exports.authenticate = (event, context, callback) => {
    const body = JSON.parse(event.body);
    const { username, password } = body;
    cognitoIdentityServiceProvider.adminInitiateAuth({
        AuthFlow: 'ADMIN_NO_SRP_AUTH',
        AuthParameters: {
            USERNAME: username,
            PASSWORD: password
        },
        ClientId: process.env.CLIENT_ID,
        UserPoolId: process.env.USER_POOL_ID
    }).promise().then(result => {
        console.log(result);
        return context.succeed({
            statusCode: 200,
            body: JSON.stringify(result.AuthenticationResult)
        });
    }).catch(error => {
        console.log(error);
        return context.fail(error);
    });
}

module.exports.register = (event, context, callback) => {
    const body = JSON.parse(event.body);
    const { username, password, phoneNumber, email, firstName, surname } = body;
    if (!firstName) return context.succeed({
        statusCode: 400,
        body: 'firstName is required'
    });
    if (!surname) return context.succeed({
        statusCode: 400,
        body: 'surname is required'
    });

    secretsPromise.then(createEthAccount).then(next).catch(context.fail);;

    function createEthAccount() {
        // const accounts = new Web3EthAccounts(process.env.RPC_ADDRESS);
        // const account = accounts.create();
        // const encrypted = accounts.encrypt(account.privateKey, password);
        const encrypted = {
            address: uuid.v1()
        };
        return Promise.resolve(encrypted);
    }

    function next(encrypted) {
        const createUserParams = {
            UserPoolId: process.env.USER_POOL_ID,
            Username: username,
            ForceAliasCreation: false,
            MessageAction: 'SUPPRESS',
            TemporaryPassword: password,
            UserAttributes: [
                {
                    Name: 'given_name',
                    Value: firstName
                },
                {
                    Name: 'family_name',
                    Value: surname
                }
            ]
        };
        if (email) {
            createUserParams.UserAttributes.push({
                Name: 'email',
                Value: email
            });
            createUserParams.UserAttributes.push({
                Name: 'email_verified',
                Value: 'true'
            });
        }
        if (phoneNumber) {
            createUserParams.UserAttributes.push({
                Name: 'phone_number',
                Value: phoneNumber
            });
            createUserParams.UserAttributes.push({
                Name: 'phone_number_verified',
                Value: 'true'
            });
        }

        return cognitoIdentityServiceProvider.adminCreateUser(createUserParams).promise().then(data => {
            console.log('create user response', data);
            let authRequest = {
                AuthFlow: 'ADMIN_NO_SRP_AUTH',
                AuthParameters: {
                    USERNAME: username,
                    PASSWORD: password,
                },
                ClientId: process.env.CLIENT_ID,
                UserPoolId: process.env.USER_POOL_ID
            };
            return cognitoIdentityServiceProvider.adminInitiateAuth(authRequest).promise();
        }).then(data => {
            if (data.ChallengeName == 'NEW_PASSWORD_REQUIRED') {
                let challengeRequest = {
                    ChallengeName: 'NEW_PASSWORD_REQUIRED',
                    ChallengeResponses: {
                        USERNAME: data.ChallengeParameters.USER_ID_FOR_SRP || username,
                        NEW_PASSWORD: password,
                    },
                    Session: data.Session,
                    ClientId: process.env.CLIENT_ID,
                    UserPoolId: process.env.USER_POOL_ID
                };
                return cognitoIdentityServiceProvider.adminRespondToAuthChallenge(challengeRequest).promise();
            }
        }).then(data => {
            const walletEvent = new DalaWalletEvent(username, EventTypes.UserConfirmed, {
                username,
                firstName,
                surname,
                phoneNumber,
                email,
                encrypted
            }, context);
            return walletEvent.save().then(() => {
                const body = JSON.stringify({
                    authToken: data.AuthenticationResult.IdToken,
                    expiresIn: data.AuthenticationResult.ExpiresIn,
                    address: encrypted.address
                })
                return context.succeed({
                    statusCode: 200,
                    body
                });
            });
        });
    }
}

