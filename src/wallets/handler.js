'use strict';

const { EventTypes } = require('../common/constants');
const { Statuses } = require('./constants');
const CognitoUtils = require('../lib/CognitoUtils');
const DalaWalletEvent = require('../model/DalaWalletEvent');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.create = (event, context) => {
    let { headers, body } = event;
    let username, senderAddress;
    if (headers.paywall) {
        //decoded parameters should be in the headers
        username = headers.username;
    } else {
        //will need to decode auth header from cognito
        username = CognitoUtils.getUsernameFromEvent(event);
        body = JSON.parse(body);
    }

    getWallet(username).then(wallet => {
        if (wallet && wallet.status == Statuses.Created) {
            return context.succeed({
                statusCode: 200,
                body: JSON.stringify({
                    username,
                    status: Statuses.Created,
                    address: wallet.address
                })
            });
        } else {
            const payload = Object.assign({}, body, { username, senderAddress });
            const eventType = EventTypes.CreateWallet;
            const walletEvent = new DalaWalletEvent(username, eventType, payload, Object.assign({}, context));

            return walletEvent.save().then(result => {
                const response = {
                    statusCode: 202,
                    body: JSON.stringify({
                        username,
                        status: Statuses.Processing
                    })
                }
                return context.succeed(response);
            })
        }
    }).catch(context.fail);
}

function getWallet(id) {
    const getParams = {
        TableName: 'DalaWallets',
        Key: { id }
    };
    return dynamodb.get(getParams).promise().then(result => result.Item);
}