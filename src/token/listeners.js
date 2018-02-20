'use strict';

const AWS = require('aws-sdk');
const stepFunctions = new AWS.StepFunctions();

module.exports.onDalaTokenEvent = (event, context, callback) => {
    var promises = event.Records.map(record => {
        if (record.eventName !== 'INSERT') return;
        const newItem = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
        const stateMachineParams = {
            stateMachineArn: process.env.ON_TOKEN_TRANSFER_STATE_MACHINE,
            input: JSON.stringify(newItem),
            name: newItem.id
        };
        return stepFunctions.startExecution(stateMachineParams).promise();
    });
    return Promise.all(promises).then(() => context.succeed(event)).catch(context.fail);
}