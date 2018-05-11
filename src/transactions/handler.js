'use strict';

const Sequelize = require('sequelize');
const { getSavingsAccount } = require('../fineract/utils');
const secretsClient = require('serverless-secrets/client');
const secretsPromise = secretsClient.load();

module.exports.getCount = (event, context) => {
  return secretsPromise
    .then(() => {
      const databaseAddress = `postgres://${process.env.DALA_STORAGE_USERNAME}:${process.env.DALA_STORAGE_PASSWORD}@${
        process.env.DALA_STORAGE_CLUSTER
      }:${process.env.STAGING_DATABASE_ENDPOINT_PORT}/${process.env.DALA_STORAGE_PORT}`;
      const sequelize = new Sequelize(databaseAddress, {
          operatorAliases: false
      });
      let { address } = event.pathParameters;
      getSavingsAccount(address)
        .then(account => {
          if (account) {
            return sequelize
              .query(`SELECT COUNT(*) FROM m_savings_account_transactions WHERE savings_account_id = ${account.savingsId}`)
              .then(rows => {
                console.log(rows);
                return context.succeed({
                  statusCode: 200,
                  body: JSON.stringify({
                    address,
                    transactionCount: rows[0]
                  })
                });
              })
              .catch(context.fail);
          } else {
            return context.succeed({
              statusCode: 200,
              body: JSON.stringify({
                address,
                transactionCount: 0
              })
            });
          }
        })
        .catch(context.fail);
    })
    .catch(context.fail);
};
