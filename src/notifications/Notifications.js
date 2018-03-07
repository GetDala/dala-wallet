'use strict';

const { Topics, Statuses } = require('./constants');
const AWS = require('aws-sdk');
const sns = new AWS.SNS();

module.exports.sendSuccessfulCreateOnChainWallet = (body) => {
    let status = Statuses.Successful;
    return sns.publish({
        TopicArn: process.env[Topics.OnChainWalletCreated],
        Message: JSON.stringify({ body, status })
    }).promise();
}

module.exports.sendFailedCreateOnChainWallet = (body) => {
    let status = Statuses.Failed;
    return sns.publish({
        TopicArn: process.env[Topics.OnChainWalletCreated],
        Message: JSON.stringify({ body, status })
    }).promise();
}

module.exports.sendFailedCreateWallet = (body) => {
    let status = Statuses.Failed;
    return sns.publish({
        TopicArn: process.env[Topics.WalletCreated],
        Message: JSON.stringify({ body, status })
    }).promise();
}

module.exports.sendFailedDeposit = (body) => {
    let status = Statuses.Failed;
    return sns.publish({
        TopicArn: process.env[Topics.Deposit],
        Message: JSON.stringify({ body, status })
    }).promise();
}

module.exports.sendFailedTransfer = (body) => {
    let status = Statuses.Failed;
    return sns.publish({
        TopicArn: process.env[Topics.Transfer],
        Message: JSON.stringify({ body, status })
    }).promise();
}

module.exports.sendFailedWithdrawal = (body) => {
    let status = Statuses.Failed;
    return sns.publish({
        TopicArn: process.env[Topics.Withdrawal],
        Message: JSON.stringify({ body, status })
    }).promise();
}

module.exports.sendSuccessfulCreateWallet = (body) => {
    let status = Statuses.Successful;
    return sns.publish({
        TopicArn: process.env[Topics.WalletCreated],
        Message: JSON.stringify({ body, status })
    }).promise();
}

module.exports.sendSuccessfulDeposit = (body) => {
    let status = Statuses.Successful;
    return sns.publish({
        TopicArn: process.env[Topics.Deposit],
        Message: JSON.stringify({ body, status })
    }).promise();
}

module.exports.sendSuccessfulTransfer = (body) => {
    let status = Statuses.Successful;
    return sns.publish({
        TopicArn: process.env[Topics.Transfer],
        Message: JSON.stringify({ body, status })
    }).promise();
}

module.exports.sendSuccessfulWithdrawal = (body) => {
    let status = Statuses.Successful;
    return sns.publish({
        TopicArn: process.env[Topics.Withdrawal],
        Message: JSON.stringify({ body, status })
    }).promise();
}