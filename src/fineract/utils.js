"use strict";

const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const {
  InvalidUserAddressCombinationError,
  ItemDoesNotExistError,
  TooManyItemsError
} = require("../common/Errors");

module.exports.getClient = username => {
  const getParams = {
    TableName: "FineractClients",
    Key: { username }
  };
  return dynamodb
    .get(getParams)
    .promise()
    .then(result => result.Item);
};

module.exports.getSavingsAccountByUsername = username => {
  return dynamodb
    .query({
      TableName: "FineractSavingsAccounts",
      IndexName: "idx_fineractSavingsAccounts_username",
      KeyConditionExpression: "#username = :username",
      ExpressionAttributeNames: {
        "#username": "username"
      },
      ExpressionAttributeValues: {
        username: username
      }
    })
    .promise()
    .then(result => {
      if (result.Count == 0)
        throw new ItemDoesNotExistError(`No account for user ${username}`);
      if (result.Count > 1)
        throw new TooManyItemsError(
          `More than one account for user ${username}`
        );
      return result.Items[0];
    });
};

module.exports.getSavingsAccount = (address, owner) => {
  const getParams = {
    TableName: "FineractSavingsAccounts",
    Key: { address }
  };
  return dynamodb
    .get(getParams)
    .promise()
    .then(result => {
      const { Item } = result;
      if (Item && owner) {
        if (Item.username === owner) return Item;
        else
          throw new InvalidUserAddressCombinationError(
            "Authenticated user does not own address"
          );
      } else {
        return Item;
      }
    });
};
