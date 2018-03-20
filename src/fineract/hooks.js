"use strict";

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');

module.exports.onWebhook = (event, context) => {
  console.log(JSON.stringify(event));
  const body = JSON.parse(event.body);
  const action = event.headers["X-Fineract-Action"];
  const entity = event.headers["X-Fineract-Entity"];

  const putParams = {
    TableName: 'FineractWebhookEvents',
    Item: {
      entityId: `${body.clientId}` || uuid.v1(),
      timestamp: new Date().toISOString(),
      payload: {
        body,
        action, 
        entity
      }
    }
  };
  return documentClient.put(putParams).promise().then(()=>{
    return context.succeed({
      statusCode: 200
    })
  }).catch(context.fail);
};