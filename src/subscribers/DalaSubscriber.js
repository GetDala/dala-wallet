'use strict';

const { Statuses } = require('./constants');
const { ItemAlreadyExistsError, InvalidStatusError } = require('../common/Errors');
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();

class DalaSubscriber {
    /**
     *                      
     * @param {string} id The ID of the subscriber
     * @param {string} sender The sender of the subscription operation 
     * @param {string} topic The topic to subscribe to 
     * @param {string} protocol The protocol of this subscription
     * @param {string} endpoint The endpoint that is subscribing
     */
    constructor(id, sender, topic, protocol, endpoint, subscriberArn = null) {
        this.id = id;
        this.sender = sender;
        this.topic = topic;
        this.protocol = protocol;
        this.endpoint = endpoint;
        this.subscriberArn = subscriberArn;
    }

    processing() {
        const updateParams = {
            TableName: 'DalaSubscribers',
            Key: { id: this.id },
            UpdateExpression: 'set #status = :status, #lastUpdated = :lastUpdated, #sender = :sender, #topic = :topic, #protocol = :protocol, #endpoint = :endpoint',
            ConditionExpression: 'attribute_not_exists(#id)',
            ExpressionAttributeNames: {
                '#id': 'id',
                '#status': 'status',
                '#lastUpdated': 'lastUpdated',
                '#sender': 'sender',
                '#topic': 'topic',
                '#protocol': 'protocol',
                '#endpoint': 'endpoint'
            },
            ExpressionAttributeValues: {
                ':status': Statuses.Processing,
                ':lastUpdated': new Date().toISOString(),
                ':sender': this.sender,
                ':topic': this.topic,
                ':protocol': this.protocol,
                ':endpoint': this.endpoint
            }
        };
        return documentClient.update(updateParams).promise().catch(error => {
            if (error.code === 'ConditionalCheckFailedException') {
                throw new ItemAlreadyExistsError('ItemAlreadyExists')
            }
            throw error;
        });
    }

    added() {
        const updateParams = {
            TableName: 'DalaSubscribers',
            Key: { id: this.id },
            UpdateExpression: 'set #status = :status, #lastUpdated = :lastUpdated, #subscriberArn = :subscriberArn',
            ConditionExpression: '#status = :currentStatus',
            ExpressionAttributeNames: {
                '#id': 'id',
                '#status': 'status',
                '#lastUpdated': 'lastUpdated',
                '#subscriberArn': 'subscriberArn'
            },
            ExpressionAttributeValues: {
                ':currentStatus': Statuses.Processing,
                ':status': Statuses.Created,
                ':lastUpdated': new Date().toISOString(),
                ':subscriberArn': this.subscriberArn
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
            TableName: 'DalaSubscribers',
            Key: { id: this.id },
            UpdateExpression: 'set #status = :status, #lastUpdated = :lastUpdated',
            ConditionExpression: '#status = :currentStatus',
            ExpressionAttributeNames: {
                '#id': 'id',
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

module.exports = DalaSubscriber;