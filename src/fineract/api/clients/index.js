'use strict';

const moment = require('moment');
const api = require('../rest');
const ClientsPath = 'clients';

module.exports = {
    create: (client, params) => {
        const path = ClientsPath;
        params = params || {};
        params.tenantIdentifier = process.env.FINERACT_TENANT_IDENTIFIER;
        return api.post(path, client, params);
    },
    get: (id, params) => { 
        const path = `${ClientsPath}/${id}`;
        params = params || {};
        params.tenantIdentifier = process.env.FINERACT_TENANT_IDENTIFIER;
        return api.get(path, params);
    },
    activate: (id, params) => { 
        const path = `${ClientsPath}/${id}`;
        params = params || {};
        params.command = 'activate';
        params.tenantIdentifier = process.env.FINERACT_TENANT_IDENTIFIER;
        const payload = {
            locale: 'en',
            dateFormat: 'dd MMMM yyyy',
            activationDate: moment.utc().format('DD MMMM YYYY')
        };
        return api.post(path, payload, params);
    }
}