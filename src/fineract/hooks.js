'use strict';

const Entities = {
    Client: 'CLIENT',
    SavingsAccount: 'SAVINGSACCOUNT',
    AccountTransfer: 'ACCOUNTTRANSFER'
}

const EventTypeMaps = {
    [`${Entities.AccountTransfer}:CREATE`]: 'dala-wallet:internal-transfer',
    [`${Entities.SavingsAccount}:ACTIVATE`]: 'dala-wallet:created',
    [`${Entities.SavingsAccount}:DEPOSIT`]: 'dala-wallet:deposit',
    [`${Entities.SavingsAccount}:WITHDRAWAL`]: 'dala-wallet:withdrawal',
}

function getEventType(event){
    const result = EventTypeMaps[event];
    return result || event;
}

const { EventTypes } = require('../common/constants');
const DalaWalletEvent = require('../model/DalaWalletEvent');
const api = require('./api');
const savings = api.savings();
const clients = api.clients();
const transfers = api.accounttransfers();

module.exports.onWebhook = (event, context, callback) => {
    console.log(JSON.stringify(event));
    const body = JSON.parse(event.body);
    const action = event.headers['X-Fineract-Action'];
    const endpoint = event.headers['X-Fineract-Endpoint'];
    const entity = event.headers['X-Fineract-Entity'];

    switch (entity) {
        case Entities.Client:
            return handleClientWebhook();
        case Entities.SavingsAccount:
            return handleSavingsAccountWebhook();
        case Entities.AccountTransfer:
            return handleAccountTransferWebhook();
        default:
            console.log('Unhandled Webhook Event');
            return context.succeed({
                statusCode: 200
            });
    }

    function handleClientWebhook() {
        //get client 
        return clients.get(body.clientId).then(client => {
            const { id, externalId, status, active, firstname, lastname, displayName, activationDate } = client;
            return {
                eventType: getEventType(`${entity}:${action}`),
                // clientId: id,
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
        }).then(payload => {
            return new DalaWalletEvent(payload.username, EventTypes.WebhookReceived, payload, context).save();
        }).then(() => {
            return context.succeed({
                statusCode: 200
            });
        })
    }

    function handleSavingsAccountWebhook() {
        return Promise.all([
            clients.get(body.clientId),
            savings.get(body.savingsId)
        ]).then(([client, savings]) => {
            return {
                eventType: getEventType(`${entity}:${action}`),
                address: savings.externalId,
                username: client.externalId,
                accountType: savings.savingsProductName,
                status: savings.status.value,
                balance: savings.summary.accountBalance
            }
        }).then(payload => {
            return new DalaWalletEvent(payload.accountId, EventTypes.WebhookReceived, payload, context).save();
        }).then(() => {
            return context.succeed({
                statusCode: 200
            });
        })
    }

    function handleAccountTransferWebhook() {
        return transfers.get(body.resourceId).then(transfer => {
            console.log(JSON.stringify(transfer));
            return Promise.all([
                clients.get(transfer.fromClient.id),
                clients.get(transfer.toClient.id),
                savings.get(transfer.fromAccount.id),
                savings.get(transfer.toAccount.id)
            ]).then(([fromClient, toClient, fromAccount, toAccount])=>{
                return {
                    eventType: getEventType(`${entity}:${action}`),
                    from: {
                        address: fromAccount.externalId,
                        username: fromClient.externalId
                    },
                    to: {
                        address: toAccount.externalId,
                        username: toClient.externalId
                    },
                    amount: transfer.transferAmount,
                    date: {
                        year: transfer.transferDate[0],
                        month: transfer.transferDate[1],
                        day: transfer.transferDate[2]
                    },
                    description: transfer.transferDescription
                }
            })
        }).then(payload => {
            return new DalaWalletEvent(`${payload.from.address}:${payload.to.address}`, EventTypes.WebhookReceived, payload, context).save()
        }).then(() => {
            return context.succeed({
                statusCode: 200
            });
        });
    }
}