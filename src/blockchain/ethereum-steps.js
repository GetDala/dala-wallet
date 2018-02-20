'use strict';

const _ = require('lodash');
const Web3 = require('web3');
const utils = require('./utils');
const secretsClient = require('serverless-secrets/client');
const secretsPromise = secretsClient.load();

class TransactionFailedError extends Error {
    /**
     * @param {string} message Message
     * @param {Object} transaction The Ethereum transaction
     */
    constructor(message, transaction) {
        super(message);
        this.transaction = transaction;
        this.name = 'TransactionFailedError';
    }
}

class TransactionNotCompleteError extends Error {
    /**
     * @param {string} message Message
     */
    constructor(message) {
        super(message);
        this.name = 'TransactionNotCompleteError';
    }
}

module.exports.getTransactionReceipt = (event, context, callback) => {
    const transactionHash = event;
    return secretsPromise.then(() => {
        const { RPC_SERVER } = process.env;
        const engine = utils.createEngine(RPC_SERVER);
        const web3 = new Web3(engine);
        web3.eth.getTransactionReceipt(transactionHash, (error, transaction) => {
            if (error) return context.fail(error);
            if (!transaction) return context.fail(new TransactionNotCompleteError('TransactionNotComplete'));
            const { status } = transaction;
            if (status === 1) {
                return context.succeed(transaction);
            } else {
                return context.fail(new TransactionFailedError('TransactionFailed', transaction));
            }
        });
    });
}