const TruffleContract = require('truffle-contract');
const Web3 = require('web3');
const ProviderEngine = require('web3-provider-engine');
const Web3Subprovider = require('web3-provider-engine/subproviders/web3.js');
const FilterSubprovider = require('web3-provider-engine/subproviders/filters.js');
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-1' });

const RPC_SERVER = process.env.RPC_SERVER;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
const contract = require('../../lib/DalaToken.json');

const DalaToken = TruffleContract(contract);

const engine = new ProviderEngine();
engine.addProvider(new FilterSubprovider());
engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(RPC_SERVER)));
engine.start();

const web3 = new Web3(new Web3.providers.HttpProvider(RPC_SERVER));

DalaToken.setProvider(engine);
DalaToken.at(TOKEN_ADDRESS).then(token => {
    token.Transfer().watch(createEvent);
}).catch(error=>{
    console.log(error);
    process.exit(1);
});

function createEvent(error, event) {
    if (error) {
        console.log(error);
        return;
    }

    const payload = {
        id: event.transactionHash, 
        timestamp: new Date().toISOString(),
        event
    };
    payload.from = event.args.from;
    payload.to = event.args.to;
    payload.value = web3.fromWei(event.args.value.toString(), 'ether');
    console.log(payload);
    var putParams = {
        TableName: 'DalaTokenEvents',
        Item: payload,
        ConditionExpression: 'attribute_not_exists(#id)',
        ExpressionAttributeNames: {
            '#id':'id'
        }
    }
    console.log('putParams', putParams);
    documentClient.put(putParams).promise().then(console.log).catch(handleFailed);

    function handleFailed(error) {
        if(error.code === 'ConditionalCheckFailedException'){
            console.log('ConditionalCheckFailed');
            //swallow
        }else{
            console.log(error);
            process.exit(2);
        }
        //what to do here
        //don't want to miss an event
        //give this some thought
    }
}