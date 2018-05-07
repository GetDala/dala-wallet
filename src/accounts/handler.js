'use strict';

const CognitoUtils = require('../lib/CognitoUtils');
const { getSavingsAccount } = require('../fineract/utils');

module.exports.get = (event, context) => {
  const { address } = event.pathParameters;
  return getSavingsAccount(address)
    .then(account => {
      console.log(account);
      const summary = account.summary || {};
      const body = JSON.stringify({
        address,
        totalDeposits: summary.totalDeposits,
        totalWithdrawals: summary.totalWithdrawals,
        balance: summary.balance
      });
      return context.succeed({
        statusCode: 200,
        body
      });
    })
    .catch(context.fail);
};
