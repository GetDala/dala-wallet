'use strict';

const EventTypes = require('../common/constants');
const CognitoUtils = require('../lib/CognitoUtils');
const DalaWalletEvent = require('../model/DalaWalletEvent');

module.exports.create = (event, context) => {
    let { headers, body } = event;
    let username, senderAddress;
    if (headers.paywall) {
        //decoded parameters should be in the headers
        username = headers.username;
    } else {
        //will need to decode auth header from cognito
        username = CognitoUtils.getUsernameFromEvent(event);
        body = JSON.parse(body);
    }
    const payload = Object.assign({}, body, { username, senderAddress });
    const eventType = EventTypes.CreateWallet;
    const walletEvent = new DalaWalletEvent(username, eventType, payload, Object.assign({}, context));

    return walletEvent.save().then(result => {
        const response = {
            statusCode: 202,
            body: JSON.stringify(result)
        }
        return context.succeed(response);
    }).catch(context.fail);
}