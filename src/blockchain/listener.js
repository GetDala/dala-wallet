const TruffleContract = require('truffle-contract');
const Web3 = require('web3');
const ethereumjsWallet = require('ethereumjs-wallet');
const ProviderEngine = require('web3-provider-engine');
const WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js');
const Web3Subprovider = require('web3-provider-engine/subproviders/web3.js');
const FilterSubprovider = require('web3-provider-engine/subproviders/filters.js');

const secret = require('../../secret');
const RPC_SERVER = secret.rpcServer;
const PRIVATE_KEY = secret.privateKey;
const TOKEN_ADDRESS = secret.tokenAddress;
const contract = require('../../lib/DalaToken.json');

const DalaToken = TruffleContract(contract);

const wallet = ethereumjsWallet.fromPrivateKey(new Buffer(PRIVATE_KEY, 'hex'));
const engine = new ProviderEngine();
engine.addProvider(new FilterSubprovider());
engine.addProvider(new WalletSubprovider(wallet, {}));
engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(RPC_SERVER)));
engine.start();

DalaToken.setProvider(engine);
DalaToken.defaults({ from: secret.fromAddress, gas: secret.gas });

DalaToken.at(TOKEN_ADDRESS).then(token => {
    token.Transfer().watch(console.log);
}).catch(console.log);