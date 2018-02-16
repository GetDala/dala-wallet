'use strict';

const EventBase = require('../lib/EventBase');

const TABLE_NAME = 'DalaWalletEvents';

class DalaWalletEvent extends EventBase {
    /**
     * 
     * @param {string} entityId - the id of the entity this event relates to
     * @param {string} eventType - the type of the event 
     * @param {*} payload - the payload for this event
     * @param {*} params - additional parameters to be stored with this event
     */
    constructor(entityId, eventType, payload, params){
        super(TABLE_NAME, entityId, eventType, payload, params);
    }
}

module.exports = DalaWalletEvent;