'use strict';

const { Topics } = require('./constants');
const AWS = require('aws-sdk');
const sns = new AWS.SNS();
const DalaWalletEvent = require('../model/DalaWalletEvent');
const { EventTypes } = require('../common/constants');

module.exports.onSuccessfulCreateWallet = (event, context, callback) => {
    const walletEvent = new DalaWalletEvent(event.id, EventTypes.Notification, Object.assign({}, event, { topic: Topics.SuccessfulCreateWallet }), context);
    return walletEvent.save().then(context.succeed).catch(context.fail);
}

module.exports.onFailedCreateWallet = (event, context, callback) => {
    const walletEvent = new DalaWalletEvent(event.id, EventTypes.Notification, Object.assign({}, event, { topic: Topics.FailedCreateWallet }), context);
    return walletEvent.save().then(context.succeed).catch(context.fail);
}

module.exports.onSuccessfulTransfer = (event, context, callback) => {
    const walletEvent = new DalaWalletEvent(event.id, EventTypes.Notification, Object.assign({}, event, { topic: Topics.SuccessfulTransfer }), context);
    return walletEvent.save().then(context.succeed).catch(context.fail);
}

module.exports.onFailedTransfer = (event, context, callback) => {
    const walletEvent = new DalaWalletEvent(event.id, EventTypes.Notification, Object.assign({}, event, { topic: Topics.FailedTransfer }), context);
    return walletEvent.save().then(context.succeed).catch(context.fail);
}

module.exports.onSuccessfulDeposit = (event, context, callback) => {
    const walletEvent = new DalaWalletEvent(event.id, EventTypes.Notification, Object.assign({}, event, { topic: Topics.SuccessfulDeposit }), context);
    return walletEvent.save().then(context.succeed).catch(context.fail);
}

module.exports.onFailedDeposit = (event, context, callback) => {
    const walletEvent = new DalaWalletEvent(event.id, EventTypes.Notification, Object.assign({}, event, { topic: Topics.FailedDeposit }), context);
    return walletEvent.save().then(context.succeed).catch(context.fail);
}

module.exports.onSuccessfulWithdrawal = (event, context, callback) => {
    const walletEvent = new DalaWalletEvent(event.id, EventTypes.Notification, Object.assign({}, event, { topic: Topics.SuccessfulWithdrawal }), context);
    return walletEvent.save().then(context.succeed).catch(context.fail);
}

module.exports.onFailedWithdrawal = (event, context, callback) => {
    const walletEvent = new DalaWalletEvent(event.id, EventTypes.Notification, Object.assign({}, event, { topic: Topics.FailedWithdrawal }), context);
    return walletEvent.save().then(context.succeed).catch(context.fail);
}