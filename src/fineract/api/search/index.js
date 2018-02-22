'use strict';

const moment = require('moment');
const api = require('../rest');
const SearchPath = 'search';

module.exports = {
    search: (params) => {
        const path = SearchPath;
        params = params || {};
        params.tenantIdentifier = process.env.FINERACT_TENANT_IDENTIFIER;
        return api.get(path, params);
    }
}