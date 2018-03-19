"use strict";

const ENTITY_ID = Symbol();
const TIMESTAMP = Symbol();
const EVENT_TYPE = Symbol();
const PAYLOAD = Symbol();
const TABLE_NAME = Symbol();
const PARAMS = Symbol();

const moment = require("moment");
const uuid = require("uuid");
const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true });

/**
 * The base class for new events
 */
class EventBase {
  /**
   *
   * @param {string} tableName The table name where these events will be stored
   * @param {string} entityId The identifier of the entity this event relates to
   * @param {string} eventType The event type
   * @param {*} payload The event payload
   * @param {*} params Additional parameters to be stored with the event
   */
  constructor(tableName, entityId, eventType, payload, params) {
    this[TABLE_NAME] = tableName;
    this[ENTITY_ID] = entityId;
    this[EVENT_TYPE] = eventType;
    this[PAYLOAD] = payload;
    this[TIMESTAMP] = moment.utc().toISOString();
    this[PARAMS] = params;
  }

  get entityId() {
    return this[ENTITY_ID];
  }

  get timestamp() {
    return this[TIMESTAMP];
  }

  get eventType() {
    return this[EVENT_TYPE];
  }

  get payload() {
    return this[PAYLOAD];
  }

  get tableName() {
    return this[TABLE_NAME];
  }

  get params() {
    return this[PARAMS];
  }

  /**
   * Converts the information to the object that will be stored
   * @returns {Object} The item that will be stored
   */
  toItem() {
    const params = this.params || {};
    const item = Object.assign(params, {
      id: uuid.v1(),
      entityId: this.entityId,
      timestamp: this.timestamp,
      payload: this.payload,
      eventType: this.eventType
    });
    return item;
  }

  /**
   * Save the event to the target event table
   * @return {Promise} The promise is resolved with the stored item
   */
  save() {
    return new Promise((resolve, reject) => {
      const item = this.toItem();
      const params = {
        TableName: this.tableName,
        Item: item
      };
      dynamoDb.put(params, (error, result) => {
        if (error) return reject(error);
        return resolve(item);
      });
    });
  }
}

module.exports = EventBase;
