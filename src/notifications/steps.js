'use strict';

const { Topics } = require('./constants');
const Notifications = require('./Notifications');
const DalaWalletEvent = require('../model/DalaWalletEvent');
const { EventTypes } = require('../common/constants');

module.exports.sendNotification = (event, context, callback)=>{
    switch(event.topic){
        case Topics.FailedCreateWallet:
            return Notifications.sendFailedCreateWallet(event, context);
        case Topics.FailedDeposit:
            return Notifications.sendFailedDeposit(event, context);
        case Topics.FailedTransfer:
            return Notifications.sendFailedTransfer(event, context);
        case Topics.FailedWithdrawal:
            return Notifications.sendFailedWithdrawal(event, context);
        case Topics.SuccessfulCreateWallet:
            return Notifications.sendSuccessfulCreateWallet(event, context);
        case Topics.SuccessfulDeposit:
            return Notifications.sendSuccessfulDeposit(event, context);
        case Topics.SuccessfulTransfer:
            return Notifications.sendSuccessfulTransfer(event, context);
        case Topics.SuccessfulWithdrawal:
            return Notifications.sendSuccessfulWithdrawal(event, context);
        default:
            return context.fail(new Error(`Unrecognized Topic: ${event.topic}`));
    }
}

module.exports.onSuccessfulCreateWallet = (event, context, callback) => {
    const walletEvent = new DalaWalletEvent(event.id, EventTypes.Notification, Object.assign({}, event, { topic: Topics.WalletStatus }), context);
    return walletEvent.save().then(context.succeed).catch(context.fail);
}

module.exports.onFailedCreateWallet = (event, context, callback) => {
    const walletEvent = new DalaWalletEvent(event.id, EventTypes.Notification, Object.assign({}, event, { topic: Topics.WalletStatus }), context);
    return walletEvent.save().then(context.succeed).catch(context.fail);
}

module.exports.onSuccessfulTransfer = (event, context, callback) => {
    const walletEvent = new DalaWalletEvent(event.id, EventTypes.Notification, Object.assign({}, event, { topic: Topics.Transfer }), context);
    return walletEvent.save().then(context.succeed).catch(context.fail);
}

module.exports.onFailedTransfer = (event, context, callback) => {
    const walletEvent = new DalaWalletEvent(event.id, EventTypes.Notification, Object.assign({}, event, { topic: Topics.Transfer }), context);
    return walletEvent.save().then(context.succeed).catch(context.fail);
}

module.exports.onSuccessfulDeposit = (event, context, callback) => {
    const walletEvent = new DalaWalletEvent(event.id, EventTypes.Notification, Object.assign({}, event, { topic: Topics.Deposit }), context);
    return walletEvent.save().then(context.succeed).catch(context.fail);
}

module.exports.onFailedDeposit = (event, context, callback) => {
    const walletEvent = new DalaWalletEvent(event.id, EventTypes.Notification, Object.assign({}, event, { topic: Topics.Deposit }), context);
    return walletEvent.save().then(context.succeed).catch(context.fail);
}

module.exports.onSuccessfulWithdrawal = (event, context, callback) => {
    const walletEvent = new DalaWalletEvent(event.id, EventTypes.Notification, Object.assign({}, event, { topic: Topics.Withdrawal }), context);
    return walletEvent.save().then(context.succeed).catch(context.fail);
}

module.exports.onFailedWithdrawal = (event, context, callback) => {
    const walletEvent = new DalaWalletEvent(event.id, EventTypes.Notification, Object.assign({}, event, { topic: Topics.Withdrawal }), context);
    return walletEvent.save().then(context.succeed).catch(context.fail);
}