'use strict';

const Web3 = require('web3');
const ProviderEngine = require('web3-provider-engine');
const Web3Subprovider = require('web3-provider-engine/subproviders/web3.js');
const FilterSubprovider = require('web3-provider-engine/subproviders/filters.js');
const HookedWalletEthTxSubprovider = require('web3-provider-engine/subproviders/hooked-wallet-ethtx.js');

module.exports.createEngine = createEngine;

/**
 * Create an instance of web3-provider-engine with optional HookedWalletEthTxSubprovider if private key and address provided
 * @param {string} rpcServer The url of the rcp server
 * @param {string} privateKey The private key for the provided address
 * @param {string} address The address
 * @returns {ProviderEngine}
 */
function createEngine(rpcServer, privateKey, address) {
    const engine = new ProviderEngine();
    engine.addProvider(new FilterSubprovider());
    if (privateKey && address) {
        engine.addProvider(new HookedWalletEthTxSubprovider({
            getAccounts: (cb) => {
                return cb(null, [address]);
            },
            getPrivateKey: (address, cb) => {
                cb(null, new Buffer(privateKey, 'hex'));
            }
        }));
    }
    engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(rpcServer)));
    engine.start();
    return engine;
}