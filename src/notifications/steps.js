"use strict";

const { EventTypes } = require("../common/constants");
const Notifications = require("./Notifications");

module.exports.onSuccessfulCreateOnChainWallet = (event, context) => {
  const body = {
    eventType: EventTypes.OnChainWalletCreateSuccessful,
    username: event.username,
    address: event.transactionReceipt.contractAddress
  };
  return Notifications.sendSuccessfulCreateOnChainWallet(body)
    .then(context.succeed)
    .catch(context.fail);
};

module.exports.onFailedCreateOnChainWallet = (event, context) => {
  const body = {
    eventType: EventTypes.OnChainWalletCreateFailed,
    username: event.username
  };
  return Notifications.sendFailedCreateOnChainWallet(body)
    .then(context.succeed)
    .catch(context.fail);
};

module.exports.onSuccessfulCreateWallet = (event, context) => {
  return Notifications.sendSuccessfulCreateWallet(event)
    .then(context.succeed)
    .catch(context.fail);
};

module.exports.onFailedCreateWallet = (event, context) => {
  return Notifications.sendFailedCreateWallet(event)
    .then(context.succeed)
    .catch(context.fail);
};

module.exports.onSuccessfulTransfer = (event, context) => {
  return Notifications.sendSuccessfulTransfer(event)
    .then(context.succeed)
    .catch(context.fail);
};

module.exports.onFailedTransfer = (event, context) => {
  return Notifications.sendFailedTransfer(event)
    .then(context.succeed)
    .catch(context.fail);
};

module.exports.onSuccessfulDeposit = (event, context) => {
  return Notifications.sendSuccessfulDeposit(event)
    .then(context.succeed)
    .catch(context.fail);
};

module.exports.onFailedDeposit = (event, context) => {
  return Notifications.sendFailedDeposit(event)
    .then(context.succeed)
    .catch(context.fail);
};

module.exports.onSuccessfulWithdrawal = (event, context) => {
  return Notifications.sendSuccessfulWithdrawal(event)
    .then(context.succeed)
    .catch(context.fail);
};

module.exports.onFailedWithdrawal = (event, context) => {
  return Notifications.sendFailedWithdrawal(event)
    .then(context.succeed)
    .catch(context.fail);
};
