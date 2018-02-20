'use strict';

const DalaSubscriber = require('./DalaSubscriber');
const { Statuses } = require('./constants');
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

module.exports.subscriberProcessing = (event, context, callback) => {
    const { id, sender, topic, endpoint, protocol } = event.payload;
    const subscriber = new DalaSubscriber(id, sender, topic, endpoint, protocol);
    return subscriber.processing().then(context.succeed).catch(context.fail);
}

module.exports.subscriberAdded = (event, context, callback) => {
    const { id, sender, topic, endpoint, protocol } = event.payload;
    const { SubscriptionArn } = event.subscriberResult;
    const subscriber = new DalaSubscriber(id, sender, topic, endpoint, protocol, SubscriptionArn);
    return subscriber.added().then(context.succeed).catch(context.fail);
}

module.exports.subscriberFailed = (event, context, callback) => {
    const { id, sender, topic, endpoint, protocol } = event.payload;
    const subscriber = new DalaSubscriber(id, sender, topic, endpoint, protocol);
    return subscriber.processing().then(context.succeed).catch(context.fail);
}

module.exports.subscriberRemoved = (event, context, callback) => {
    return context.fail(new Error('NotImplemented'));
}