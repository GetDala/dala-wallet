'use strict';

const { EventTypes } = require('../common/constants');
const uuid = require('uuid');
const DalaWalletEvent = require('../model/DalaWalletEvent');

module.exports.addSubscriber = (event, context, callback) => {
    const body = JSON.parse(event.body);
    const headers = JSON.parse(event.headers);
    const { protocol, endpoint, topic } = body;
    const id = uuid.v1();
    const sender = headers['x-sender-address'];
    const payload = { sender, id, protocol, endpoint, topic };
    const walletEvent = new DalaWalletEvent(sender, EventTypes.CreateSubscriber, payload, Object.assign({}, context));
    
    return walletEvent.save().then(()=>{
        let response = {
            statusCode: 202,
            body: JSON.stringify(payload)
        }
        return context.succeed(response);
    }).catch(context.fail);
}