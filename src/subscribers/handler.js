'use strict';

const { Actions } = require('./constants');
const AWS = require('aws-sdk');
const sns = new AWS.SNS();

module.exports.post = (event, context, callback) => {
    const qs = event.queryStringParameters;
    const body = JSON.parse(event.body);
    const headers = event.headers;
    switch ((qs.action||'').toLowerCase()) {
        case Actions.Subscribe:
            return subscribe();
        case Actions.Confirm:
            return confirm();
        default:
            return context.succeed({
                statusCode: 400,
                body: 'InvalidAction'
            });
    }

    function confirm() {
        let { token, topicArn } = body;
        return sns.confirmSubscription({
            TopicArn: topicArn,
            Token: token
        }).promise().then(result => {
            return context.succeed({
                statusCode: 200,
                body: JSON.stringify(result)
            });
        }).catch(context.fail);
    }

    function subscribe() {
        let { protocol, endpoint, topic } = body;
        let topicArn = process.env[topic.toUpperCase()];

        return sns.subscribe({
            TopicArn: topicArn,
            Protocol: protocol,
            Endpoint: endpoint
        }).promise().then(result => {
            return context.succeed({
                statusCode: 200,
                body: JSON.stringify(result)
            });
        }).catch(context.fail);
    }
}