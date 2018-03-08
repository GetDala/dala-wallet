'use strict';

const { Statuses } = require('./constants');
const { ItemAlreadyExistsError, InvalidStatusError } = require('../common/Errors');
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();

class TokenTransfer
{
    /**
     * 
     * @param {string} id   The ID of the transfer 
     */
    constructor(id){
        this.id = id;
    }

    /**
     * Update the transfer status to PROCESSING
     */
    processing(){
        const updateParams = {
            TableName: 'TokenTransfers',
            Key: {id: this.id},
            UpdateExpression: 'set #status = :status, #lastUpdated = :lastUpdated',
            ConditionExpression: 'attribute_not_exists(#id)',
            ExpressionAttributeNames: {
                '#id':'id',
                '#status':'status',
                '#lastUpdated':'lastUpdated'
            },
            ExpressionAttributeValues:{
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

    /**
     * Update the transfer status to COMPLETE
     */
    complete(){
        const updateParams = {
            TableName: 'TokenTransfers',
            Key: { id: this.id },
            UpdateExpression: 'set #status = :status, #lastUpdated = :lastUpdated',
            ConditionExpression: '#status = :currentStatus',
            ExpressionAttributeNames: {
                '#status': 'status',
                '#lastUpdated': 'lastUpdated'
            },
            ExpressionAttributeValues: {
                ':currentStatus': Statuses.Processing,
                ':status': Statuses.Complete,
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

    /**
     * Update the transfer status to FAILED
     */
    failed(){
        const updateParams = {
            TableName: 'TokenTransfers',
            Key: { id: this.id },
            UpdateExpression: 'set #status = :status, #lastUpdated = :lastUpdated',
            ConditionExpression: '#status = :currentStatus',
            ExpressionAttributeNames: {
                '#status': 'status',
                '#lastUpdated': 'lastUpdated'
            },
            ExpressionAttributeValues: {
                ':currentStatus': Statuses.Processing,
                ':status': Statuses.Failed,
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

module.exports = TokenTransfer;