'use strict';

const moment = require('moment');
const api = require('../rest');
const AccountTransfersPath = 'accounttransfers';

module.exports = {
    create:(transfer, params)=>{
        const path = AccountTransfersPath;
        transfer.fromAccountType = 2;
        transfer.toAccountType = 2;
        params = params || {};
        params.tenantIdentifier = process.env.FINERACT_TENANT_IDENTIFIER;
        return api.post(path, transfer, params);
    },
    get:(id, params)=>{
        const path = `${AccountTransfersPath}/${id}`;
        params = params || {};
        params.tenantIdentifier = process.env.FINERACT_TENANT_IDENTIFIER;
        return api.get(path, params);
    }
};