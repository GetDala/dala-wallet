'use strict';

const EventTypes = require('./constants').EventTypes;
const CognitoUtils = require('../lib/CognitoUtils');
const DalaWalletEvent = require('./DalaWalletEvent');

module.exports.create = (event, context, callback) => {
    const sub = CognitoUtils.getSubFromEvent(event);
    const payload = JSON.parse(event.body);
    const eventType = EventTypes.Create;
    const walletEvent = new DalaWalletEvent(sub, eventType, payload, Object.assign({}, context));

    return walletEvent.save().then(result=>{
        const response = {
            statusCode: 202,
            body: JSON.stringify(result)
        }
        return context.succeed(response);
    }).catch(context.fail);
}