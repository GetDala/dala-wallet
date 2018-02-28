'use strict';

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.getClient = (username) => {
    const getParams = {
        TableName: 'FineractClients',
        Key: { username }
    };
    return dynamodb.get(getParams).promise().then(result => result.Item);
}

module.exports.getSavingsAccount = (username) => {
    const getParams = {
        TableName: 'FineractAccounts',
        Key: { username }
    };
    return dynamodb.get(getParams).promise().then(result => result.Item);
}