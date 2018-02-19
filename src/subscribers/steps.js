'use strict';

const AWS = require('aws-sdk');
const sns = new AWS.SNS();

module.exports.subscribe = (event, context, callback) => {
    const { sender, id, topic, protocol, endpoint } = event;

    const topicArn = process.env[topic.toUpperCase()];

    sns.subscribe({
        TopicArn: topicArn,
        Protocol: protocol,
        Endpoint: endpoint
    }).promise().then(context.succeed).catch(context.fail);
}