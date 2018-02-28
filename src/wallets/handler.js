'use strict';

const EventTypes = require('../common/constants');
const CognitoUtils = require('../lib/CognitoUtils');
const DalaWalletEvent = require('../model/DalaWalletEvent');

module.exports.create = (event, context, callback) => {
    const {username, senderAddress, body} = event;

    // const sub = CognitoUtils.getSubFromEvent(event);
    // const username = CognitoUtils.getUsernameFromEvent(event);
    // const body = JSON.parse(event.body);
    const payload = Object.assign({}, body, {username});
    const eventType = EventTypes.CreateWallet;
    const walletEvent = new DalaWalletEvent(username, eventType, payload, Object.assign({}, context));

    return walletEvent.save().then(result=>{
        const response = {
            statusCode: 202,
            body: JSON.stringify(result)
        }
        return context.succeed(response);
    }).catch(context.fail);
}