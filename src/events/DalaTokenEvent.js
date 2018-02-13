'use strict';

const EventSourceBase = require('wala-common/src/aws/dynamodb/EventSourceBase');

const TABLE_NAME = 'DalaTokenEvents';

class DalaTokenEvent extends EventSourceBase{
    constructor(entityId, eventType, payload, params){
        super(TABLE_NAME, entityId, eventType, payload, params);
    }
}

module.exports = DalaTokenEvent;