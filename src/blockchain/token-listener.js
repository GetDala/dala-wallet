const TruffleContract = require('truffle-contract');
const Web3 = require('web3');
const ProviderEngine = require('web3-provider-engine');
const Web3Subprovider = require('web3-provider-engine/subproviders/web3.js');
const FilterSubprovider = require('web3-provider-engine/subproviders/filters.js');
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({ region: process.AWS_REGION || 'eu-west-1' });
var bunyan = require('bunyan');

const RPC_SERVER = process.env.RPC_SERVER;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
const contract = require('../../lib/DalaToken.json');

const DalaToken = TruffleContract(contract);

const engine = new ProviderEngine();
engine.addProvider(new FilterSubprovider());
engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(RPC_SERVER)));
engine.start();

const web3 = new Web3(new Web3.providers.HttpProvider(RPC_SERVER));

var loggerDefinition = {
    name: 'dala-token-listener',
    INSTANCE_ID: process.env.INSTANCE_ID,
    serializers: { error: bunyan.stdSerializers.err }
}
var log = bunyan.createLogger(loggerDefinition);

process.on('exit', (exitCode) => {
    log.error({ exitCode }, 'dala-token-listener has exited');
});

process.on('uncaughtException', (error) => {
    log.error({ error }, error.message);
})

process.on('unhandledRejection', (reason, p) => {
    log.error({ reason, p }, 'Unhandled Rejection at:' + p);
});


log.info({}, `dala-token-listener is up and running on instance ${process.env.INSTANCE_ID}`);

DalaToken.setProvider(engine);
DalaToken.at(TOKEN_ADDRESS).then(token => {
    token.Transfer().watch(createEvent);
}).catch(error => {
    log.error({ error }, 'error occured');
    process.exit(1);
});

function createEvent(error, event) {
    if (error) {
        log.error({ error, event }, 'Error occured on create event');
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
    log.info({ payload }, 'payload for event');
    var putParams = {
        TableName: 'DalaTokenEvents',
        Item: payload,
        ConditionExpression: 'attribute_not_exists(#id)',
        ExpressionAttributeNames: {
            '#id': 'id'
        }
    }
    log.info({ putParams }, 'putParams for DalaTokenEvents');
    documentClient.put(putParams).promise().then(console.log).catch(handleFailed);

    function handleFailed(error) {
        if (error.code === 'ConditionalCheckFailedException') {
            log.info({ error, event }, 'ConditionalCheckFailed');
            //swallow
        } else {
            log.fatal({ error }, 'fatal error occured');
            process.exit(2);
        }
    }
}