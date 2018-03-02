'use strict';

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const {InvalidUserAddressCombinationError} = require('../common/Errors');

module.exports.getClient = (username) => {
    const getParams = {
        TableName: 'FineractClients',
        Key: { username }
    };
    return dynamodb.get(getParams).promise().then(result => result.Item);
}

module.exports.getSavingsAccount = (address, owner) => {
    const getParams = {
        TableName: 'FineractSavingsAccounts',
        Key: { address }
    };
    return dynamodb.get(getParams).promise().then(result => {
        const {Item} = result;
        if(Item && owner){
            if(Item.username === owner)
                return Item;
            else
                throw new InvalidUserAddressCombinationError('Authenticated user does not own address');
        }else{
            return Item;
        }
    });
}