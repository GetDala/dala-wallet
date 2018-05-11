'use strict';

const Sequelize = require('sequelize');
const { getSavingsAccount } = require('../fineract/utils');
const secretsClient = require('serverless-secrets/client');
const secretsPromise = secretsClient.load();

module.exports.getCount = (event, context) => {
  return secretsPromise
    .then(() => {
      const databaseAddress = `mysql://${process.env.DALA_STORAGE_USERNAME}:${process.env.DALA_STORAGE_PASSWORD}@${
        process.env.DALA_STORAGE_CLUSTER
      }:${process.env.DALA_STORAGE_PORT}/mifostenant-default`;
      console.log(databaseAddress);
      const sequelize = new Sequelize(databaseAddress, {
        operatorsAliases: false
      });
      let { address } = event.pathParameters;
      return getSavingsAccount(address).then(account => {
        console.log('have savings account', account);
        if (account) {
          console.log('calling sequelize');
          return sequelize.query(`SELECT COUNT(*) as transactionCount FROM m_savings_account_transaction WHERE savings_account_id = ${account.savingsId}`).then(rows => {
            console.log(rows);
            return context.succeed({
              statusCode: 200,
              body: JSON.stringify({
                address,
                transactionCount: rows[0][0].transactionCount
              })
            });
          });
        } else {
          console.log('no account');
          return context.succeed({
            statusCode: 200,
            body: JSON.stringify({
              address,
              transactionCount: 0
            })
          });
        }
      });
    })
    .catch(context.fail);
};
