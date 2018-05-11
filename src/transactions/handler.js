'use strict';

const Sequelize = require('sequelize');
const databaseAddress = `postgres://${process.env.STAGING_DATABASE_USERNAME}:${process.env.STAGING_DATABASE_PASSWORD}@${
  process.env.STAGING_DATABASE_ENDPOINT_ADDRESS
}:${process.env.STAGING_DATABASE_ENDPOINT_PORT}/${process.env.STAGING_DATABASE}`;
const sequelize = new Sequelize(databaseAddress);
const { getSavingsAccount } = require('../fineract/utils');

module.exports.getCount = (event, context) => {
  let { address } = event.pathParameters;
  getSavingsAccount(address)
    .then(account => {
      if (account) {
          return sequelize.query(`SELECT COUNT(*) FROM m_savings_account_transactions WHERE savings_account_id = ${account.savingsId}`).then(rows=>{
              console.log(rows);
              return context.succeed({
                  statusCode: 200,
                  body: JSON.stringify({
                      address,
                      transactionCount: rows[0]
                  })
              });
          }).catch(context.fail);
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
};
