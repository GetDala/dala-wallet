'use strict';

const { EventTypes } = require('./constants');
const StreamUtils = require('../lib/StreamUtils');

module.exports.onDalaWalletEvent = (event, context) => {
  return StreamUtils.startStateMachinePerItem(event, {
    [EventTypes.CreateWallet]: {
      stateMachineArn: process.env.ON_CREATE_ON_CHAIN_WALLET_STATE_MACHINE
    },
    [EventTypes.CreateSubscriber]: {
      stateMachineArn: process.env.ON_CREATE_SUBSCRIBER_STATE_MACHINE
    },
    [EventTypes.UserConfirmed]: {
      stateMachineArn: process.env.ON_USER_CONFIRMED_STATE_MACHINE
    },
    [EventTypes.WebhookReceived]: {
      stateMachineArn: process.env.ON_WEBHOOK_RECEIVED_STATE_MACHINE
    },
    [EventTypes.ExternalTransfer]: {
      stateMachineArn: process.env.ON_EXTERNAL_TRANSFER_STATE_MACHINE
    }
  })
    .then(() => context.succeed(event))
    .catch(error => {
      console.log(error);
      if (error.code == 'ExecutionAlreadyExists') {
        return context.succed({
          error,
          message: 'Execution exists. Continuting'
        });
      } else {
        return context.fail(error);
      }
    });
};
