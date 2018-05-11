'use strict';

const CognitoUtils = require('../lib/CognitoUtils');
const api = require('../fineract/api');
const { getSavingsAccount } = require('../fineract/utils');

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
        totalDeposits: summary.totalDeposits,
        totalWithdrawals: summary.totalWithdrawals,
        balance: summary.accountBalance
      });
      return context.succeed({
        statusCode: 200,
        body
      });
    })
    .catch(context.fail);
};