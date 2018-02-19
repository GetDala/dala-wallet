'use strict';

const { Statuses } = require('./constants');
const { ItemAlreadyExistsError, InvalidStatusError } = require('../common/Errors');
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();

class DalaWallet {
    constructor(username, address = null) {
        super();
        this.username = username;
        this.address = address;
    }

    processing() {
        const updateParams = {
            TableName: 'DalaWallets',
            Key: { username: this.username },
            UpdateExpression: 'set #status = :status, #lastUpdated = :lastUpdated',
            ConditionExpression: 'attribute_not_exists(#username)',
            ExpressionAttributeNames: {
                '#username': 'username',
                '#status': 'status',
                '#lastUpdated': 'lastUpdated'
            },
            ExpressionAttributeValues: {
                ':status': Statuses.Processing,
                ':lastUpdated': new Date().toISOString()
            }
        };
        return documentClient.update(updateParams).promise().catch(error => {
            if (error.code === 'ConditionalCheckFailedException') {
                throw new ItemAlreadyExistsError('ItemAlreadyExists')
            }
            throw error;
        });
    }

    created() {
        const updateParams = {
            TableName: 'DalaWallets',
            Key: { username: this.username },
            UpdateExpression: 'set #status = :status, #lastUpdated = :lastUpdated',
            ConditionExpression: '#status = :currentStatus',
            ExpressionAttributeNames: {
                '#username': 'username',
                '#status': 'status',
                '#lastUpdated': 'lastUpdated'
            },
            ExpressionAttributeValues: {
                ':currentStatus': Statuses.Processing,
                ':status': Statuses.Created,
                ':lastUpdated': new Date().toISOString()
            }
        };
        return documentClient.update(updateParams).promise().catch(error => {
            if (error.code === 'ConditionalCheckFailedException') {
                throw new InvalidStatusError('InvalidStatus')
            }
            throw error;
        });
    }

    failed() {
        const updateParams = {
            TableName: 'DalaWallets',
            Key: { username: this.username },
            UpdateExpression: 'set #status = :status, #lastUpdated = :lastUpdated',
            ConditionExpression: '#status = :currentStatus',
            ExpressionAttributeNames: {
                '#username': 'username',
                '#status': 'status',
                '#lastUpdated': 'lastUpdated'
            },
            ExpressionAttributeValues: {
                ':currentStatus': Statuses.Processing,
                ':status': Statuses.Created,
                ':lastUpdated': new Date().toISOString()
            }
        };
        return documentClient.update(updateParams).promise().catch(error => {
            if (error.code === 'ConditionalCheckFailedException') {
                throw new InvalidStatusError('InvalidStatus')
            }
            throw error;
        });
    }
}