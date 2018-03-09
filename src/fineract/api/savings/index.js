'use strict';

const moment = require('moment');
const api = require('../rest');
const SavingsPath = 'savingsaccounts';

module.exports = {
    create: (account, params) => { 
        const path = SavingsPath;
        params = params || {};
        params.tenantIdentifier = process.env.FINERACT_TENANT_IDENTIFIER;
        return api.post(path, account, params);
    },
    get: (id, params) => { 
        const path = `${SavingsPath}/${id}`;
        params = params || {};
        params.tenantIdentifier = process.env.FINERACT_TENANT_IDENTIFIER;
        return api.get(path, params);
    },
    approve: (id, params) => {
        const path = `${SavingsPath}/${id}`;
        params = params || {};
        params.command = 'approve';
        params.tenantIdentifier = process.env.FINERACT_TENANT_IDENTIFIER;
        const payload = {
            locale: 'en',
            dateFormat: 'dd MMMM yyyy',
            approvedOnDate: moment.utc().format('DD MMMM YYYY')
        };
        return api.post(path, payload, params);
    },
    activate: (id, params) => {
        const path = `${SavingsPath}/${id}`;
        params = params || {};
        params.command = 'activate';
        params.tenantIdentifier = process.env.FINERACT_TENANT_IDENTIFIER;
        const payload = {
            locale: 'en',
            dateFormat: 'dd MMMM yyyy',
            activatedOnDate: moment.utc().format('DD MMMM YYYY')
        };
        return api.post(path, payload, params);
    },
    close: (id, params)=>{
        const path = `${SavingsPath}/${id}`;
        params = params || {};
        params.command = 'close';
        params.tenantIdentifier = process.env.FINERACT_TENANT_IDENTIFIER;
        const payload = {
            locale: 'en',
            dateFormat: 'dd MMMM yyyy',
            closedOnDate: moment.utc().format('DD MMMM YYYY')
        };
        return api.post(path, payload, params);
    },
    undoApproval: (id, params) => { 
        const path = `${SavingsPath}/${id}`;
        params = params || {};
        params.command = 'undoApproval';
        params.tenantIdentifier = process.env.FINERACT_TENANT_IDENTIFIER;
        const payload = {};
        return api.post(path, payload, params);
    },
    deposit: (id, deposit, params) => { 
        const path = `${SavingsPath}/${id}/transactions`;
        params = params || {};
        params.command = 'deposit';
        params.tenantIdentifier = process.env.FINERACT_TENANT_IDENTIFIER;
        const payload = {
            locale: 'en',
            dateFormat: 'dd MMMM yyyy',
            transactionDate: moment.utc(deposit.date).format('DD MMMM YYYY'),
            transactionAmount: deposit.amount,
            paymentTypeId: deposit.type
        };
        return api.post(path, payload, params);
    },
    withdrawal: (id, withdrawal, params) => { 
        const path = `${SavingsPath}/${id}/transactions`;
        params = params || {};
        params.command = 'withdrawal';
        params.tenantIdentifier = process.env.FINERACT_TENANT_IDENTIFIER;
        const payload = {
            locale: 'en',
            dateFormat: 'dd MMMM yyyy',
            transactionDate: moment.utc(withdrawal.date).format('DD MMMM YYYY'),
            transactionAmount: withdrawal.amount,
            paymentTypeId: withdrawal.type,
            externalId: withdrawal.externalId
        };
        return api.post(path, payload, params);
    },
    undo: (accountId, transactionId) => { 
        const path = `${SavingsPath}/${accountId}/transactions/${transactionId}`;
        const params = {
            command: 'undo',
            tenantIdentifier: process.env.FINERACT_TENANT_IDENTIFIER
        };
        const payload = {};
        return api.post(path, payload, params);
    },
    hold: (id, params, hold) => { 
        const path = `${SavingsPath}/${id}/transactions`;
        params = params || {};
        params.command = 'hold';
        params.tenantIdentifier = process.env.FINERACT_TENANT_IDENTIFIER;
        const payload = {
            locale: 'en',
            dateFormat: 'dd MMMM yyyy',
            transactionDate: moment.utc(hold.date).format('DD MMMM YYYY'),
            transactionAmount: hold.amount
        };
        return api.post(path, payload, params);
    },
    release: (accountId, transactionId) => { 
        const path = `${SavingsPath}/${accountId}/transactions/${transactionId}`;
        const params = {
            command: 'release',
            tenantIdentifier: process.env.FINERACT_TENANT_IDENTIFIER
        };
        const payload = {};
        return api.post(path, payload, params);
    },
    getTransaction: (accountId, transactionId, params)=>{
        const path = `${SavingsPath}/${accountId}/transactions/${transactionId}`;
        params = params || {};
        params.tenantIdentifier = process.env.FINERACT_TENANT_IDENTIFIER;
        return api.get(path, params);
    }
}