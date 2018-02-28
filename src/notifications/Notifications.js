'use strict';

const {Topics,Statuses} = require('./constants');
const AWS = require('aws-sdk');
const sns = new AWS.SNS();

module.exports.sendFailedCreateWallet = (body, context) => {
    let status = Statuses.Failed;
    return sns.publish({
        TopicArn: process.env[Topics.WalletCreated],
        Message: JSON.stringify({body,status})
    }).promise();
}

module.exports.sendFailedDeposit = (body, context) => { 
    let status = Statuses.Failed;
    return sns.publish({
        TopicArn: process.env[Topics.Deposit],
        Message: JSON.stringify({body,status})
    }).promise();
}

module.exports.sendFailedTransfer = (body, context) => { 
    let status = Statuses.Failed;
    return sns.publish({
        TopicArn: process.env[Topics.Transfer],
        Message: JSON.stringify({body,status})
    }).promise();
}

module.exports.sendFailedWithdrawal = (body, context) => { 
    let status = Statuses.Failed;
    return sns.publish({
        TopicArn: process.env[Topics.Withdrawal],
        Message: JSON.stringify({body,status})
    }).promise();
}

module.exports.sendSuccessfulCreateWallet = (body, context) => { 
    let status = Statuses.Successful;
    return sns.publish({
        TopicArn: process.env[Topics.WalletCreated],
        Message: JSON.stringify({body,status})
    }).promise();
}

module.exports.sendSuccessfulDeposit = (body, context) => { 
    let status = Statuses.Successful;
    return sns.publish({
        TopicArn: process.env[Topics.Deposit],
        Message: JSON.stringify({body,status})
    }).promise();
}

module.exports.sendSuccessfulTransfer = (body, context) => { 
    let status = Statuses.Successful;
    return sns.publish({
        TopicArn: process.env[Topics.Transfer],
        Message: JSON.stringify({body,status})
    }).promise();
}

module.exports.sendSuccessfulWithdrawal = (body, context) => { 
    let status = Statuses.Successful;
    return sns.publish({
        TopicArn: process.env[Topics.Withdrawal],
        Message: JSON.stringify({body,status})
    }).promise();
}