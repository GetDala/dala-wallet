'use strict';

const {EventTypes} = require('../common/constants');
const DalaWalletEvent = require('../model/DalaWalletEvent');

module.exports.onWebhook = (event, context, callback)=>{
    const body = JSON.parse(event.body);
    const action = event.headers['X-Fineract-Action'];
    const endpoint = event.headers['X-Fineract-Endpoint'];
    const entity = event.headers['X-Fineract-Entity'];
    let entityId = (body.savingsId || body.clientId || uuid.v1()).toString();
    console.log('event', JSON.stringify(event));
    return context.succeed({
        statusCode: 200,
        body: ''
    });
}