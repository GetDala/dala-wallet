'use strict';

const Entities = {
  Client: 'CLIENT',
  SavingsAccount: 'SAVINGSACCOUNT',
  AccountTransfer: 'ACCOUNTTRANSFER'
};

const EventTypeMaps = {
  [`${Entities.AccountTransfer}:CREATE`]: 'dala-wallet:internal-transfer',
  [`${Entities.SavingsAccount}:ACTIVATE`]: 'dala-wallet:created',
  [`${Entities.SavingsAccount}:DEPOSIT`]: 'dala-wallet:deposit',
  [`${Entities.SavingsAccount}:WITHDRAWAL`]: 'dala-wallet:withdrawal'
};

function getEventType(event) {
  const result = EventTypeMaps[event];
  return result || event;
}

const async = require('async');
const AWS = require('aws-sdk');
const { EventTypes } = require('../common/constants');
const DalaWalletEvent = require('../model/DalaWalletEvent');
const api = require('./api');
const savings = api.savings();
const clients = api.clients();
const transfers = api.accounttransfers();

module.exports.onFineractWebhookEvent = (event, context) => {
  return new Promise((resolve, reject) => {
    async.each(event.Records, (record, done) => {
        if (record.eventName !== 'INSERT') return done();
        const newItem = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
        onWebhook(newItem.payload).then(done).catch(done);
    }, (error, results) => {
        if (error) return reject(error);
        return resolve(null, event);
    });
});

  // var promises = event.Records.map(record => {
  //   if (record.eventName !== 'INSERT') return Promise.resolve(null);
  //   const newItem = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
  //   return onWebhook(newItem.payload);
  // });
  // return Promise.all(promises)
  //   .then(() => context.succeed(event))
  //   .catch(error => {
  //     console.log('ERROR', error);
  //     console.log('ERROR.JSON', JSON.stringify(error));

  //     return context.fail(error);
    // });
// };

const onWebhook = event => {
  console.log(JSON.stringify(event));
  let { body, action, entity } = event;

  switch (entity) {
    case Entities.Client:
      return handleClientWebhook();
    case Entities.SavingsAccount:
      switch (action) {
        case 'ACTIVATE':
          return handleSavingsAccountWebhook(false);
        case 'DEPOSIT':
          return handleSavingsAccountWebhook(true);
        case 'WITHDRAWAL':
          return handleSavingsAccountWebhook(true);
        default:
          console.log('DEFAULT ... resolving empty object');
          return Promise.resolve({});
      }
    case Entities.AccountTransfer:
      return handleAccountTransferWebhook();
    default:
      console.log('Unhandled Webhook Event');
      return Promise.resolve({});
  }

  function handleClientWebhook() {
    //get client
    console.log('handleClientWebhook.body', body);
    return clients
      .get(body.clientId)
      .then(client => {
        const { externalId, status, firstname, lastname, displayName, activationDate } = client;
        let result = {
          eventType: getEventType(`${entity}:${action}`),
          username: externalId,
          status: status.value,
          activationDate: {
            year: activationDate[0],
            month: activationDate[1],
            day: activationDate[2]
          },
          firstName: firstname,
          surname: lastname,
          displayName: displayName
        };
        console.log('handleClientWebhook:have result', result);
        return result;
      })
      .then(payload => {
        console.log('handleClientWebhook.writingEvent');
        return new DalaWalletEvent(payload.username, EventTypes.WebhookReceived, payload).save();
      })
      // .catch(error => {
      //   console.log(error);
      //   if (!error) {
      //     console.log('handleClientWebhook NULL error mesage ... succeed');
      //     return;
      //   } else {
      //     throw error;
      //   }
      // });
  }

  function handleSavingsAccountWebhook(isTransaction) {
    console.log('handleSavingsAccountWebhook.body', body);
    return Promise.all([
      clients.get(body.clientId),
      savings.get(body.savingsId),
      isTransaction ? savings.getTransaction(body.savingsId, body.resourceId) : Promise.resolve(null)
    ])
      .then(([client, savings, transaction]) => {
        console.log('handleSavingsAccountWebhook:have client, savings, transactions');
        let result = {
          eventType: getEventType(`${entity}:${action}`),
          transactionId: transaction && transaction.id,
          address: savings.externalId,
          username: client.externalId,
          balance: savings.summary.accountBalance,
          amount: transaction && transaction.amount,
          date: transaction && {
            year: transaction.date[0],
            month: transaction.date[1],
            day: transaction.date[2]
          }
        };
        console.log('handleSavingsAccountWebhook:have result', result);
        return result;
      })
      .then(payload => {
        console.log('handleSavingsAccountWebhook.writingEvent');
        return new DalaWalletEvent(payload.accountId, EventTypes.WebhookReceived, payload).save();
      })
      // .catch(error => {
      //   console.log(error);
      //   if (!error) {
      //     console.log('handleSavingsAccountWebhook: NULL error mesage ... succeed');
      //     return;
      //   } else {
      //     throw error;
      //   }
      // });
  }

  function handleAccountTransferWebhook() {
    console.log('handleAccountTransferWebhook.body', body);
    return transfers
      .get(body.resourceId)
      .then(transfer => {
        console.log(JSON.stringify(transfer));
        return Promise.all([
          clients.get(transfer.fromClient.id),
          clients.get(transfer.toClient.id),
          savings.get(transfer.fromAccount.id),
          savings.get(transfer.toAccount.id)
        ]).then(([fromClient, toClient, fromAccount, toAccount]) => {
          console.log('handleAccountTransferWebhook:have fromClient, toClient, fromAccount, toAccount');
          let result = {
            eventType: getEventType(`${entity}:${action}`),
            transactionId: body.resourceId,
            from: {
              address: fromAccount.externalId,
              username: fromClient.externalId,
              balance: fromAccount.summary.accountBalance
            },
            to: {
              address: toAccount.externalId,
              username: toClient.externalId,
              balance: toAccount.summary.accountBalance
            },
            amount: transfer.transferAmount,
            date: {
              year: transfer.transferDate[0],
              month: transfer.transferDate[1],
              day: transfer.transferDate[2]
            },
            description: transfer.transferDescription
          };
          console.log('handleAccountTransferWebhook:have result', result);
          return result;
        });
      })
      .then(payload => {
        console.log('handleAccountTransferWebhook.writingEvent');
        return new DalaWalletEvent(`${payload.from.address}:${payload.to.address}`, EventTypes.WebhookReceived, payload).save();
      })
      // .catch(error => {
      //   console.log(error);
      //   if (!error) {
      //     console.log('handleAccountTransferWebhook NULL error mesage ... succeed');
      //     return;
      //   } else {
      //     throw error;
      //   }
      // });
  }
};
