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
      const sequelize = new Sequelize(databaseAddress, {
        operatorsAliases: false
      });
      let { address } = event.pathParameters;
      return getSavingsAccount(address).then(account => {
        if (account) {
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

module.exports.getTransactions = (event, context)=>{
  return secretsPromise
    .then(() => {
      const databaseAddress = `mysql://${process.env.DALA_STORAGE_USERNAME}:${process.env.DALA_STORAGE_PASSWORD}@${
        process.env.DALA_STORAGE_CLUSTER
      }:${process.env.DALA_STORAGE_PORT}/mifostenant-default`;
      const sequelize = new Sequelize(databaseAddress, {
        operatorsAliases: false
      });
      let { address } = event.pathParameters;
      return getSavingsAccount(address).then(account => {
        if (account) {
          let query = `select sat.id as transactionId, sa.external_id as address, if(sat.transaction_type_enum = 1,'credit','debit') as creditOrDebit, sat.amount, sat.transaction_date as transactionDate, if(source.description is null, target.description, source.description) as additionalData from m_savings_account_transaction sat \
          join m_savings_account sa on sa.id = sat.savings_account_id \
          left outer join m_account_transfer_transaction source on source.from_savings_transaction_id = sat.id \
          left outer join m_account_transfer_transaction target on target.to_savings_transaction_id = sat.id \
          where sa.external_id = ${address} \
          order by transactionId desc`
          return sequelize.query(query).then(rows => {
            return context.succeed({
              statusCode: 200,
              body: JSON.stringify({
                items: rows[0],
                count: rows[0].length
              })
            });
          });
        } else {
          return context.succeed({
            statusCode: 200,
            body: JSON.stringify({
              address,
              items:[],
              count: 0
            })
          });
        }
      });
    })
    .catch(context.fail);
}