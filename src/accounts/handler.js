'use strict';

const CognitoUtils = require('../lib/CognitoUtils');
const { getSavingsAccount } = require('../fineract/utils');

module.exports.get = (event, context)=>{
    let { headers, pathParameters } = event;
    let username;
    if (headers.paywall) {
        //decoded parameters should be in the headers
        username = headers.username;
    } else {
        //will need to decode auth header from cognito
        username = CognitoUtils.getUsernameFromEvent(event);
    }
    const {address} = pathParameters;
    return getSavingsAccount(address, username).then(account=>{
        const body = JSON.stringify({
            address,
            totalDeposits: account.summary.totalDeposits,
            totalWithdrawals: account.summary.totalWithdrawals,
            balance: account.summary.balance
        });
        return context.succeed({
            statusCode: 200,
            body
        })
    })
}