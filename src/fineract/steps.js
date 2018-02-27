'use strict';

const moment = require('moment');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const api = require('./api');
const { MissingParameterError } = require('../common/Errors');

module.exports.createClient = (event, context, callback) => {
    const clients = api.clients();
    const { firstName, surname, username, phoneNumber, email } = event;
    if (!firstName) return context.fail(new MissingParameterError('firstName is required', 'firstName'));
    if (!surname) return context.fail(new MissingParameterError('surname is required', 'surname'));
    if (!username) return context.fail(new MissingParameterError('username is required', 'username'));

    return getClient().then(createClient).then(context.succeed).catch(error=>{
        console.log(JSON.stringify(error));
        context.fail(error);
    });

    function getClient(payload) {
        const getParams = {
            TableName: 'FineractClients',
            Key: { username }
        };
        return dynamodb.get(getParams).promise();
    }

    function createClient(result) {
        let fc = result.Item;
        if (fc) return clients.get(fc.clientId);

        return clients.create({
            officeId: 1,
            firstname: firstName,
            lastname: surname,
            mobileNo: phoneNumber,
            externalId: username,
            active: true,
            locale: 'en',
            dateFormat: 'dd MMMM yyyy',
            activationDate: moment.utc().format('DD MMMM YYYY'),
            submittedOnDate: moment.utc().format('DD MMMM YYYY')
        }, {}).then(client => {
            const fc = Object.assign({}, { username }, client);
            var putParams = {
                TableName: 'FineractClients',
                Item: fc
            };
            return dynamodb.put(putParams).promise().then(() => clients.get(fc.clientId));
        });
    }
}

module.exports.createAccount = (event, context, callback) => {
    const accounts = api.savings();
    const { username } = event;
    if (!username) return context.fail(new MissingParameterError('username is required', 'username'));

    return getSavingsAccount().then(createSavingsAccount).then(context.succeed).catch(context.fail);

    function getClient(payload) {
        const getParams = {
            TableName: 'FineractClients',
            Key: { username }
        };
        return dynamodb.get(getParams).promise();
    }

    function getSavingsAccount(payload) {
        const getParams = {
            TableName: 'FineractAccounts',
            Key: { username }
        };
        return dynamodb.get(getParams).promise();
    }

    function getProduct() {
        return Promise.resolve(process.env.DALA_ACCOUNT_PRODUCT);
    }

    function createSavingsAccount(result) {
        let fa = result.Item;
        if (fa) return accounts.get(fa.savingsId);
        return Promise.all([
            getClient(),
            getProduct()
        ]).then(results => {
            const clientId = results[0].Item.clientId;
            const productId = results[1];
            const payload = {
                clientId,
                productId,
                locale: 'en',
                dateFormat: 'dd MMMM yyyy',
                submittedOnDate: moment.utc().format('DD MMMM YYYY'),
                externalId: username
            };
            return accounts.create(payload);
        }).then(account => {
            const fa = Object.assign({}, { username }, account);
            var putParams = {
                TableName: 'FineractAccounts',
                Item: fa
            };
            return dynamodb.put(putParams).promise().then(() => accounts.get(fa.savingsId));
        });
    }

    return context.succeed(event);
}

module.exports.approveAccount = (event, context, callback) => {
    const savings = api.savings();
    const {username} = event;
    if (!username) return context.fail(new MissingParameterError('username is required', 'username'));

    return getSavingsAccount().then(approve).then(context.succeed).catch(error => {
        log.error({ error, event, context }, 'error in approve');
        return context.fail(error);
    });

    function getSavingsAccount(payload) {
        const getParams = {
            TableName: 'FineractAccounts',
            Key: { username }
        };
        return dynamodb.get(getParams).promise();
    }

    function approve(result) {
        let fa = result.Item;
        if (!fa) return Promise.reject(new Error(`No entry in FineractAccounts for ${username}`));
        return savings.approve(fa.savingsId);
    }
}

module.exports.activateAccount = (event, context, callback) => {
    const savings = api.savings();
    const {username} = event;
    if (!username) return context.fail(new MissingParameterError('username is required', 'username'));

    return getSavingsAccount().then(activate).then(context.succeed).catch(error => {
        log.error({ error, event, context }, 'error in activate');
        return context.fail(error);
    });

    function getSavingsAccount(payload) {
        const getParams = {
            TableName: 'FineractAccounts',
            Key: { username }
        };
        return dynamodb.get(getParams).promise();
    }

    function activate(result) {
        let fa = result.Item;
        if (!fa) return Promise.reject(new Error(`No entry in FineractAccounts for ${username}`));
        return savings.activate(fa.savingsId);
    }
}