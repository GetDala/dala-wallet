'use strict';

const Web3 = require('web3');
const TruffleContract = require('truffle-contract');
const ProviderEngine = require('web3-provider-engine');
const WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js');
const Web3Subprovider = require('web3-provider-engine/subproviders/web3.js');
const FilterSubprovider = require('web3-provider-engine/subproviders/filters.js');
const HookedWalletEthTxSubprovider = require('web3-provider-engine/subproviders/hooked-wallet-ethtx.js');
const RpcSubprovider = require('web3-provider-engine/subproviders/rpc.js');
const EthTx = require('ethereumjs-tx');
const ethUtil = require('ethereumjs-util');
const BigNumber = require("bignumber.js");
const secretsClient = require('serverless-secrets/client');
const secretsPromise = secretsClient.load();

const contract = require('../../lib/DalaWallet.json');
const DalaWallet = TruffleContract(contract);

module.exports.sweep = (event, context, callback) => {
    return secretsPromise.then(() => {
        const { RPC_SERVER, PRIVATE_KEY, FROM_ADDRESS, DEFAULT_GAS } = process.env;
        const engine = createEngine(RPC_SERVER, PRIVATE_KEY, `0x${FROM_ADDRESS}`);
        DalaWallet.setProvider(engine);
        DalaWallet.defaults({ from: `0x${FROM_ADDRESS}`, gas: DEFAULT_GAS });
        return DalaWallet.at(event.walletAddress).then(wallet => {
            return wallet;
        });
    }).then(wallet => {
        return wallet.sweep();
    }).then(result => {
        //did the wallet sweep work fine
        return context.succeed(event);
    }).catch(error => {
        return context.fail(error);
    });
}

function createEngine(rpcServer, privateKey, fromAddress) {
    const engine = new ProviderEngine();
    engine.addProvider(new FilterSubprovider());
    engine.addProvider(new HookedWalletEthTxSubprovider({
        getAccounts: (cb) => {
            return cb(null, [fromAddress]);
        },
        getPrivateKey: (address, cb) => {
            cb(null, new Buffer(privateKey, 'hex'));
        }
    }));
    engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(rpcServer)));
    engine.start();
    return engine;
}