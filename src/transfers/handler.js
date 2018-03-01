'use strict';

const web3 = require('web3');
const moment = require('moment');
const CognitoUtils = require('../lib/CognitoUtils');
const { TransferTypes } = require('./constants');
const DalaWalletEvent = require('../model/DalaWalletEvent');
const { EventTypes } = require('../common/constants');
const api = require('../fineract/api');
const transfers = api.accounttransfers();
const { getClient, getSavingsAccount } = require('../fineract/utils');

module.exports.createInternalTransfer = (event, context, callback) => {
    const userId = CognitoUtils.getUsernameFromEvent(event);
    const body = JSON.parse(event.body);
    return internalTransfer().then(result => {
        console.log(JSON.stringify(result));
        return context.succeed({
            statusCode: 200,
            body: JSON.stringify({
                from: userId,
                to: body.to,
                amount: body.amount
            })
        });
    }).catch(context.fail);

    function internalTransfer() {
        return Promise.all([
            getSavingsAccount(userId),
            getSavingsAccount(body.to)
        ]).then(([fromAccount, toAccount]) => {
            const payload = {
                fromOfficeId: fromAccount.officeId,
                fromClientId: fromAccount.clientId,
                fromAccountType: 1,
                fromAccountId: fromAccount.savingsId,
                toOfficeId: toAccount.officeId,
                toClientId: toAccount.clientId,
                toAccountType: 1,
                toAccountId: toAccount.savingsId,
                transferDate: moment.utc().format('DD MMMM YYYY'),
                locale: 'en',
                dateFormat: 'dd MMMM yyyy',
                transferAmount: body.amount,
                transferDescription: body.description
            };
            console.log(JSON.stringify(payload));
            return transfers.create(payload);
        }).then(result => {
            console.log(JSON.stringify(result));
            return result;
        }).catch(error => {
            console.log(JSON.stringify(error));
            throw error;
        });
    }
}

module.exports.createExternalTransfer = (event, context, callback) => {
    const userId = CognitoUtils.getUsernameFromEvent(event);
    const body = JSON.parse(event.body);
    return externalTransfer().then(result => {
        return context.succeed({
            statusCode: 202,
            body: 'transfer is being processed'
        });
    }).catch(context.fail);

    function externalTransfer() {
        if (!web3.utils.isAddress(body.to)) {
            return context.succeed({
                statusCode: 400,
                body: `${body.to} is not a valid Ethereum address`
            });
        }
        return new DalaWalletEvent(userId, EventTypes.ExternalTransfer, {
            from: userId,
            to: body.to,
            amount: body.amount
        }, Object.assign({}, context, { userId })).save();
    }
}