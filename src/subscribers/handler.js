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
        if(!token) return context.succeed({
            statusCode: 400,
            body: 'token is required'
        });
        if(!topicArn) return context.succeed({
            statusCode: 400,
            body: 'topicArn is required'
        });
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
        if(!protocol) return context.succeed({
            statusCode: 400,
            body: 'protocol is required - one of http|https|email|email-json|sms|sqs|application|lambda'
        });
        if(!endpoint) return context.succeed({
            statusCode: 400,
            body: 'endpoint is required'
        });
        if(!topic) return context.succeed({
            statusCode: 400,
            body: 'topic is required - one of WALLET_CREATED_TOPIC|TRANSFER_TOPIC|WITHDRAWAL_TOPIC|DEPOSIT_TOPIC'
        });
        
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