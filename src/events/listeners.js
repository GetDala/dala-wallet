'use strict';

const AWS = require('aws-sdk');
const stepFunctions = new AWS.StepFunctions();

module.exports.onDalaTokenEvent = (event, context, callback) => {
    //the event
    var promises = event.Records.map(record => {
        if (record.eventName !== 'INSERT') return;
        const newItem = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
        const stateMachineParams = {
            stateMachineArn: process.env.STATE_MACHINE_ON_TOKEN_TRANSFER,
            input: JSON.stringify(newItem),
            name: newItem.id
        };
        stepFunctions.startExecution(stateMachineParams).promise();
    });
    return Promise.all(promises).then(() => context.succeed(event)).catch(contex.fail);
}