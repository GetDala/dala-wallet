'use strict';

const { EventTypes } = require('../common/constants');
const DalaWalletEvent = require('../model/DalaWalletEvent');

module.exports.onUserConfirmed = (event, context, callback) => {
    //need to create a fineract client and account - start a state machine
    const walletEvent = new DalaWalletEvent(event.id, EventTypes.UserConfirmed, event, context);
    return walletEvent.save().then(context.succeed).catch(context.fail);
}