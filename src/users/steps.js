'use strict';

const ClientIdAttribute = 'custom:client_id';
const DefaultAccountIdAttribute = 'custom:account_id';
const DefaultAccountAddressAttribute = 'custom:account_address';
const AWS = require('aws-sdk');
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

module.exports.setClientId = (event, context) => {
    const { username, fineractClient } = event;
    cognitoIdentityServiceProvider.adminUpdateUserAttributes({
        Username: username,
        UserPoolId: process.env.USER_POOL_ID,
        UserAttributes: [
            {
                Name: ClientIdAttribute,
                Value: `${fineractClient.id}`
            }
        ]
    }).promise().then(context.succeed).catch(context.fail);
}

module.exports.setDefaultAccountId = (event, context) => {
    const { username, fineractAccount } = event;
    cognitoIdentityServiceProvider.adminUpdateUserAttributes({
        Username: username,
        UserPoolId: process.env.USER_POOL_ID,
        UserAttributes: [
            {
                Name: DefaultAccountIdAttribute,
                Value: `${fineractAccount.id}`
            }
        ]
    }).promise().then(context.succeed).catch(context.fail);
}

module.exports.setDefaultAccountAddress = (event, context) => {
    const { username, encrypted } = event;
    cognitoIdentityServiceProvider.adminUpdateUserAttributes({
        Username: username,
        UserPoolId: process.env.USER_POOL_ID,
        UserAttributes: [
            {
                Name: DefaultAccountAddressAttribute,
                Value: `0x${encrypted.address}`
            }
        ]
    }).promise().then(context.succeed).catch(context.fail);
}