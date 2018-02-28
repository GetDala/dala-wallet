'use strict';

const { EventTypes } = require('./constants');
const StreamUtils = require('../lib/StreamUtils');

module.exports.onDalaWalletEvent = (event, context, callback) => {
    return StreamUtils.startStateMachinePerItem(event, {
        [EventTypes.CreateWallet]: {
            stateMachineArn: process.env.ON_CREATE_WALLET_STATE_MACHINE
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
        [EventTypes.ExternalTransfer] : {
            stateMachineArn: process.env.ON_EXTERNAL_TRANSFER_STATE_MACHINE
        }
    }).then(() => context.succeed(event)).catch(context.fail);
};