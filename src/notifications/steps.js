'use strict';

const Notifications = require('./Notifications');

module.exports.onSuccessfulCreateOnChainWallet = (event, context) => {
    return Notifications.sendSuccessfulCreateOnChainWallet(event).then(context.succeed).catch(context.fail);
}

module.exports.onFailedCreateOnChainWallet = (event, context) => {
    return Notifications.sendFailedCreateOnChainWallet(event).then(context.succeed).catch(context.fail);
}

module.exports.onSuccessfulCreateWallet = (event, context) => {
    return Notifications.sendSuccessfulCreateWallet(event).then(context.succeed).catch(context.fail);
}

module.exports.onFailedCreateWallet = (event, context) => {
    return Notifications.sendFailedCreateWallet(event).then(context.succeed).catch(context.fail);
}

module.exports.onSuccessfulTransfer = (event, context) => {
    return Notifications.sendSuccessfulTransfer(event).then(context.succeed).catch(context.fail);
}

module.exports.onFailedTransfer = (event, context) => {
    return Notifications.sendFailedTransfer(event).then(context.succeed).catch(context.fail);
}

module.exports.onSuccessfulDeposit = (event, context) => {
    return Notifications.sendSuccessfulDeposit(event).then(context.succeed).catch(context.fail);
}

module.exports.onFailedDeposit = (event, context) => {
    return Notifications.sendFailedDeposit(event).then(context.succeed).catch(context.fail);
}

module.exports.onSuccessfulWithdrawal = (event, context) => {
    return Notifications.sendSuccessfulWithdrawal(event).then(context.succeed).catch(context.fail);
}

module.exports.onFailedWithdrawal = (event, context) => {
    return Notifications.sendFailedWithdrawal(event).then(context.succeed).catch(context.fail);
}