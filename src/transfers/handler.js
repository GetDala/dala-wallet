'use strict';

const web3 = require('web3');
const moment = require('moment');
const CognitoUtils = require('../lib/CognitoUtils');
const DalaWalletEvent = require('../model/DalaWalletEvent');
const { EventTypes } = require('../common/constants');
const api = require('../fineract/api');
const transfers = api.accounttransfers();
const { getSavingsAccount } = require('../fineract/utils');
const Big = require('big.js');

module.exports.createInternalTransfer = (event, context) => {
    let { headers, body } = event;
    let username;
    if (headers.paywall) {
        //decoded parameters should be in the headers
        username = headers.username;
    } else {
        //will need to decode auth header from cognito
        username = CognitoUtils.getUsernameFromEvent(event);
        body = JSON.parse(body);
    }
    return internalTransfer().then(result => {
        console.log(JSON.stringify(result));
        return context.succeed({
            statusCode: 200,
            body: JSON.stringify({
                from: body.from,
                to: body.to,
                amount: body.amount
            })
        });
    }).catch(context.fail);

    function internalTransfer() {
        return Promise.all([
            getSavingsAccount(body.from, username),
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
                transferAmount: Number(new Big(body.amount).round(6)),
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

module.exports.createExternalTransfer = (event, context) => {
    let { headers, body } = event;
    let username;
    if (headers.paywall) {
        //decoded parameters should be in the headers
        username = headers.username;
    } else {
        //will need to decode auth header from cognito
        username = CognitoUtils.getUsernameFromEvent(event);
        body = JSON.parse(body);
    }
    return externalTransfer().then(() => {
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
        return new DalaWalletEvent(username, EventTypes.ExternalTransfer, {
            from: username,
            to: body.to,
            amount: body.amount
        }, Object.assign({}, context, { username })).save();
    }
}