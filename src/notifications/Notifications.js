'use strict';

const AWS = require('aws-sdk');
const sns = new AWS.SNS();

module.exports.sendFailedCreateWallet = (event, context) => {
    console.log(event);
    return context.succeed(event);
}

module.exports.sendFailedDeposit = (event, context) => { 
    console.log(event);
    return context.succeed(event);
}

module.exports.sendFailedTransfer = (event, context) => { 
    console.log(event);
    return context.succeed(event);
}

module.exports.sendFailedWithdrawal = (event, context) => { 
    console.log(event);
    return context.succeed(event);
}

module.exports.sendSuccessfulCreateWallet = (event, context) => { 
    console.log(event);
    return context.succeed(event);
}

module.exports.sendSuccessfulDeposit = (event, context) => { 
    console.log(event);
    return context.succeed(event);
}

module.exports.sendSuccessfulTransfer = (event, context) => { 
    console.log(event);
    return context.succeed(event);
}

module.exports.sendSuccessfulWithdrawal = (event, context) => { 
    console.log(event);
    return context.succeed(event);
}