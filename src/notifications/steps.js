'use strict';

const { Topics } = require('./constants');
const Notifications = require('./Notifications');
const DalaWalletEvent = require('../model/DalaWalletEvent');
const { EventTypes } = require('../common/constants');

module.exports.onSuccessfulCreateWallet = (event, context, callback) => {
    return Notifications.sendSuccessfulCreateWallet(event).then(context.succeed).catch(context.fail);
}

module.exports.onFailedCreateWallet = (event, context, callback) => {
    return Notifications.sendFailedCreateWallet(event).then(context.succeed).catch(context.fail);
}

module.exports.onSuccessfulTransfer = (event, context, callback) => {
    return Notifications.sendSuccessfulTransfer(event).then(context.succeed).catch(context.fail);
}

module.exports.onFailedTransfer = (event, context, callback) => {
    return Notifications.sendFailedTransfer(event).then(context.succeed).catch(context.fail);
}

module.exports.onSuccessfulDeposit = (event, context, callback) => {
    return Notifications.sendSuccessfulDeposit(event).then(context.succeed).catch(context.fail);
}

module.exports.onFailedDeposit = (event, context, callback) => {
    return Notifications.sendFailedDeposit(event).then(context.succeed).catch(context.fail);
}

module.exports.onSuccessfulWithdrawal = (event, context, callback) => {
    return Notifications.sendSuccessfulWithdrawal(event).then(context.succeed).catch(context.fail);
}

module.exports.onFailedWithdrawal = (event, context, callback) => {
    return Notifications.sendFailedWithdrawal(event).then(context.succeed).catch(context.fail);
}