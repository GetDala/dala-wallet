'use strict';

const AWS = require('aws-sdk');
const stepFunctions = new AWS.StepFunctions();
const uuid = require('uuid');

/**
 * 
 * @param {Object} event    The DynamoDB event
 * @param {Object} params   The params
 * @param {Object} params[eventType]    The configuration for an event type
 * @param {string} params[eventType].stateMachineArn   The ARN of the state machine that should be started
 * @param {Promise} params[eventType].createInput  The function to create the state machine input. If not provided, will default to the item
 * @param {Function} params[eventType.getId   Get the id from the new item. If not provided, uses the 'id' property of the new item or 'uuid.v1()' if not present
 */
module.exports.startStateMachinePerItem = (event, params) => {
    var promises = event.Records.map(record => {
        if (record.eventName !== 'INSERT') return;
        const newItem = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
        const eventType = newItem.eventType || 'Default';
        const createInput = (params[eventType].createInput) || ((item) => Promise.resolve(item.payload));
        const getId = params[eventType].getId || ((item) => item.id || uuid.v1());
        return createInput(newItem).then(input => {
            const stateMachineParams = {
                stateMachineArn: params[eventType].stateMachineArn,
                input: JSON.stringify(input),
                name: getId(newItem)
            };
            return stepFunctions.startExecution(stateMachineParams).promise();
        });
    });
    return Promise.all(promises);
};