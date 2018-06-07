'use strict';

const moment = require('moment');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const api = require('./api');
const savings = api.savings();
const { getSavingsAccountByUsername, getSavingsAccount, getClient } = require('./utils');
const { DepositTypes } = require('./constants');
const { MissingParameterError } = require('../common/Errors');

module.exports.createClient = (event, context) => {
  const clients = api.clients();
  const { firstName, surname, username } = event;
  if (!firstName) return context.fail(new MissingParameterError('firstName is required', 'firstName'));
  if (!surname) return context.fail(new MissingParameterError('surname is required', 'surname'));
  if (!username) return context.fail(new MissingParameterError('username is required', 'username'));

  return getClient(username)
    .then(createClient)
    .then(context.succeed)
    .catch(error => {
      console.log(JSON.stringify(error));
      context.fail(error);
    });

  function createClient(result) {
    let fc = result;
    if (fc) return clients.get(fc.clientId);

    return clients
      .create(
        {
          officeId: 1,
          firstname: firstName,
          lastname: surname,
          externalId: username,
          active: true,
          locale: 'en',
          dateFormat: 'dd MMMM yyyy',
          activationDate: moment.utc().format('DD MMMM YYYY'),
          submittedOnDate: moment.utc().format('DD MMMM YYYY')
        },
        {}
      )
      .then(client => {
        const fc = Object.assign({}, { username }, client);
        var putParams = {
          TableName: 'FineractClients',
          Item: fc
        };
        return dynamodb
          .put(putParams)
          .promise()
          .then(() => clients.get(fc.clientId));
      });
  }
};

module.exports.createAccount = (event, context) => {
  const accounts = api.savings();
  const { username, encrypted } = event;
  if (!username) return context.fail(new MissingParameterError('username is required', 'username'));
  if (!encrypted || !encrypted.address) return context.fail(new MissingParameterError('encrypted.address is required'));
  const address = `0x${encrypted.address}`;

  return getSavingsAccount(address)
    .then(createSavingsAccount)
    .then(context.succeed)
    .catch(error => {
      console.log(JSON.stringify(error));
      context.fail(error);
    });

  function getProduct() {
    return Promise.resolve(process.env.DALA_ACCOUNT_PRODUCT);
  }

  function createSavingsAccount(result) {
    let fa = result;
    if (fa) return accounts.get(fa.savingsId);
    return Promise.all([getClient(username), getProduct()])
      .then(results => {
        const clientId = results[0].clientId;
        const productId = results[1];
        const payload = {
          clientId,
          productId,
          locale: 'en',
          dateFormat: 'dd MMMM yyyy',
          submittedOnDate: moment.utc().format('DD MMMM YYYY'),
          externalId: address
        };
        return accounts.create(payload);
      })
      .then(account => {
        const fa = Object.assign({}, { address, username, encrypted }, account);
        var putParams = {
          TableName: 'FineractSavingsAccounts',
          Item: fa
        };
        return dynamodb
          .put(putParams)
          .promise()
          .then(() => accounts.get(fa.savingsId));
      });
  }
};

module.exports.approveAccount = (event, context) => {
  const savings = api.savings();
  const { username, encrypted } = event;
  if (!username) return context.fail(new MissingParameterError('username is required', 'username'));
  if (!encrypted || !encrypted.address) return context.fail(new MissingParameterError('encrypted.address is required'));
  const address = `0x${encrypted.address}`;

  return getSavingsAccount(address)
    .then(approve)
    .then(context.succeed)
    .catch(apiError => {
      console.log(apiError);
      let error = apiError.body;
      console.log(JSON.stringify(error));
      console.log(JSON.stringify(error));
      if (error.errors && error.errors.length) {
        if (
          error.errors.filter(
            e => e.userMessageGlobalisationCode === 'validation.msg.savingsaccount.approval.not.in.submittedandpendingapproval.state'
          ).length > 0
        ) {
          return context.succeed({
            code: 'AccountAlreadyApproved'
          });
        }
      }
      return context.fail(error);
    });

  function approve(result) {
    let fa = result;
    if (!fa) return Promise.reject(new Error(`No entry in FineractSavingsAccounts for ${address}`));
    return savings.approve(fa.savingsId);
  }
};

module.exports.activateAccount = (event, context) => {
  const savings = api.savings();
  const { username, encrypted } = event;
  if (!username) return context.fail(new MissingParameterError('username is required', 'username'));
  if (!encrypted || !encrypted.address) return context.fail(new MissingParameterError('encrypted.address is required'));
  const address = `0x${encrypted.address}`;

  return getSavingsAccount(address)
    .then(activate)
    .then(context.succeed)
    .catch(apiError => {
      console.log(apiError);
      let error = apiError.body;
      console.log(JSON.stringify(error));
      if (error.errors && error.errors.length) {
        if (
          error.errors.filter(
            e => e.userMessageGlobalisationCode === 'validation.msg.savingsaccount.activate.not.in.approved.state'
          ).length > 0
        ) {
          return context.succeed({
            code: 'AccountAlreadyActivated'
          });
        }
      }
      return context.fail(error);
    });

  function activate(result) {
    let fa = result;
    if (!fa) return Promise.reject(new Error(`No entry in FineractSavingsAccounts for ${address}`));
    return savings.activate(fa.savingsId);
  }
};

module.exports.tokenTransferDeposit = (event, context) => {
  const { id, from, to, value, timestamp, wallet, sweepTransactionHash } = event;
  return getSavingsAccountByUsername(wallet.id)
    .then(account => {
      return savings.deposit(account.savingsId, {
        amount: value,
        type: process.env.PAYMENT_TYPE_ON_CHAIN_DEPOSIT,
        date: timestamp
      });
    })
    .then(result => {
      return dynamodb
        .put({
          TableName: 'FineractDeposits',
          Item: {
            depositId: id,
            depositType: DepositTypes.OnChainDeposit,
            resourceId: result.resourceId,
            from,
            to,
            value,
            timestamp,
            fineractDepositResult: result,
            depositTransactionHash: id,
            sweepTransactionHash
          }
        })
        .promise();
    })
    .then(() => {
      return {
        id,
        from,
        to,
        value
      };
    })
    .catch(error => {
      console.log(JSON.stringify(error));
      context.fail(error);
    });
};
