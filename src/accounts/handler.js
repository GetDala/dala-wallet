'use strict';

const CognitoUtils = require('../lib/CognitoUtils');
const api = require('../fineract/api');
const Sequelize = require('sequelize');
const { getSavingsAccount } = require('../fineract/utils');
const secretsClient = require('serverless-secrets/client');
const secretsPromise = secretsClient.load();


module.exports.get = (event, context) => {
  const savings = api.savings();
  const { address } = event.pathParameters;
  return getSavingsAccount(address)
    .then(({ savingsId }) => savings.get(savingsId))
    .then(account => {
      console.log(account);
      const summary = account.summary || {};
      const body = JSON.stringify({
        address,
        balance: summary.accountBalance
      });
      return context.succeed({
        statusCode: 200,
        body
      });
    })
    .catch(context.fail);
};

module.exports.getBalance = (event, context)=>{
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
          return sequelize.query(`select sum(IF(transaction_type_enum = 2,amount*-1,amount)) as balance from m_savings_account_transaction WHERE savings_account_id = ${account.savingsId}`).then(rows => {
            console.log(rows);
            return context.succeed({
              statusCode: 200,
              body: JSON.stringify({
                address,
                balance: rows[0][0].balance
              })
            });
          });
        } else {
          console.log('no account');
          return context.succeed({
            statusCode: 200,
            body: JSON.stringify({
              address,
              balance: 'no account'
            })
          });
        }
      });
    })
    .catch(context.fail);
}