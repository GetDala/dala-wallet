'use strict';

const CognitoUtils = require('../lib/CognitoUtils');
const { getSavingsAccount } = require('../fineract/utils');

module.exports.get = (event, context) => {
  const { address } = event.pathParameters;
  return getSavingsAccount(address).then(account => {
    const body = JSON.stringify({
      address,
      totalDeposits: account.summary.totalDeposits,
      totalWithdrawals: account.summary.totalWithdrawals,
      balance: account.summary.balance
    });
    return context.succeed({
      statusCode: 200,
      body
    });
  });
};
