'use strict';

const DalaWallet = require('./DalaWallet');
const { Statuses } = require('./constants');

module.exports.walletProcessing = (event, context, callback) => {
    const wallet = new DalaWallet(event.username);
    wallet.processing().then(context.succeed).catch(context.fail);
}

module.exports.walletCreated = (event, context, callback) => {
    const wallet = new DalaWallet(event.username, event.transactionReceipt.contractAddress);
    wallet.created().then(context.succeed).catch(context.fail);
}

module.exports.walletFailed = (event, context, callback) => {
    const wallet = new DalaWallet(event.username);
    wallet.failed().then(context.succeed).catch(context.fail);
}