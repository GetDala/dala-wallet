'use strict';

const Web3 = require('web3');
const utils = require('./utils');
const secretsClient = require('serverless-secrets/client');
const secretsPromise = secretsClient.load();
const contract = require('../../lib/DalaWallet.json');

module.exports.create = (event, context) => {
    return secretsPromise.then(() => {
        const { RPC_SERVER, PRIVATE_KEY, FROM_ADDRESS, DEFAULT_GAS, DESTINATION_ADDRESS, TOKEN_ADDRESS } = process.env;
        const engine = utils.createEngine(RPC_SERVER, PRIVATE_KEY, `0x${FROM_ADDRESS}`);
        const web3 = new Web3(engine);
        const wallet = web3.eth.contract(contract.abi);
        return {
            wallet,
            from: FROM_ADDRESS,
            gas: DEFAULT_GAS,
            destination: DESTINATION_ADDRESS,
            token: TOKEN_ADDRESS,
            data: contract.bytecode
        };
    }).then(({ wallet, from, gas, destination, token, data }) => {
        return new Promise((resolve, reject) => {
            return wallet.new(destination, token, { from, gas, data }, (error, contract) => {
                if (error) return reject(error);
                return resolve({
                    address: contract.address,
                    transactionHash: contract.transactionHash
                });
            });
        });
    }).then(result => {
        return context.succeed(result);
    }).catch(error => {
        return context.fail(error);
    });
}