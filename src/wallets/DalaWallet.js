'use strict';

const { Statuses } = require('./constants');
const { ItemAlreadyExistsError, InvalidStatusError, TooManyItemsError, ItemDoesNotExistError } = require('../common/Errors');
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();

class DalaWallet {
    /**
     * 
     * @param {string} username  The username of the wallet owner
     * @param {string} address   The address of the created wallet   
     */
    constructor(username, address = null) {
        this.username = username;
        this.address = address;
    }

    static getByAddress(address){
        return documentClient.query({
            TableName: 'DalaWallets',
            IndexName: 'idx_dalaWallets_address_timestamp',
            KeyConditionExpression: '#address = :address',
            ExpressionAttributeNames: {
                '#address':'address'
            },
            ExpressionAttributeValues: {
                ':address': address
            }
        }).promise().then(result=>{
            if(result.Count == 0) throw new ItemDoesNotExistError(`Wallet with address ${address} does not exits`);
            if(result.Count > 1) throw new TooManyItemsError(`There is more than one entry for this wallet with address ${address}`);
            return result.Items[0];
        });
    }

    /**
     * Update wallet status to PROCESSING
     */
    processing() {
        const updateParams = {
            TableName: 'DalaWallets',
            Key: { id: this.username },
            UpdateExpression: 'set #status = :status, #lastUpdated = :lastUpdated',
            ConditionExpression: 'attribute_not_exists(#id)',
            ExpressionAttributeNames: {
                '#id': 'id',
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

    /**
     * Update the wallet status to CREATED
     */
    created() {
        const updateParams = {
            TableName: 'DalaWallets',
            Key: { id: this.username },
            UpdateExpression: 'set #status = :status, #address = :address, #lastUpdated = :lastUpdated, #timestamp = :timestamp',
            ConditionExpression: '#status = :currentStatus',
            ExpressionAttributeNames: {
                '#status': 'status',
                '#lastUpdated': 'lastUpdated',
                '#address': 'address',
                '#timestamp': 'timestamp'
            },
            ExpressionAttributeValues: {
                ':currentStatus': Statuses.Processing,
                ':status': Statuses.Created,
                ':lastUpdated': new Date().toISOString(),
                ':address': this.address,
                ':timestamp': new Date().toISOString()
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
     * Update the wallet status to FAILED
     */
    failed() {
        const updateParams = {
            TableName: 'DalaWallets',
            Key: { id: this.username },
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

module.exports = DalaWallet;