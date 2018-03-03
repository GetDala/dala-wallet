const TruffleContract = require('truffle-contract');
const Web3 = require('web3');
const ethereumjsWallet = require('ethereumjs-wallet');
const ProviderEngine = require('web3-provider-engine');
const WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js');
const Web3Subprovider = require('web3-provider-engine/subproviders/web3.js');
const FilterSubprovider = require('web3-provider-engine/subproviders/filters.js');
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-1' });

//const secret = require('../../secret');
const RPC_SERVER = process.env.RPC_SERVER;
//const PRIVATE_KEY = secret.privateKey;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
const contract = require('../../lib/DalaToken.json');

const DalaToken = TruffleContract(contract);

//const wallet = ethereumjsWallet.fromPrivateKey(new Buffer(PRIVATE_KEY, 'hex'));
const engine = new ProviderEngine();
engine.addProvider(new FilterSubprovider());
//engine.addProvider(new WalletSubprovider(wallet, {}));
engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(RPC_SERVER)));
engine.start();

DalaToken.setProvider(engine);
//DalaToken.defaults({ from: secret.fromAddress, gas: secret.gas });

DalaToken.at(TOKEN_ADDRESS).then(token => {
    token.Transfer().watch(createEvent);
}).catch(console.log);

function createEvent(error, event) {
    if (error) {
        console.log(error);
        return;
    }

    var putParams = {
        TableName: 'DalaTokenEvents',
        Item: Object.assign({}, event, { id: event.transactionHash }),
        ConditionExpression: 'attribute_not_exists(#id)',
        ExpressionAttributeNames: {
            '#id':'id'
        }
    }

    documentClient.put(putParams).promise().then(console.log).catch(handleFailed);

    function handleFailed(error) {
        console.log(error);
        if(error.code === 'ConditionalCheckFailedException'){
            //swallow
        }else{
            throw error;
        }
        //what to do here
        //don't want to miss an event
        //give this some thought
    }
}