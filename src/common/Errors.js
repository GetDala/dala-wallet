import { map } from "../../../../../Library/Caches/typescript/2.6/node_modules/@types/async";

'use strict';

class ItemAlreadyExistsError extends Error {
    constructor(message){
        super(message);
        this.name = 'ItemAlreadyExistsError';
    }
}

class InvalidStatusError extends Error {
    constructor(message){
        super(message);
        this.name = 'InvalidStatusError';
    }
}

module.exports.ItemAlreadyExistsError = ItemAlreadyExistsError;
module.exports.InvalidStatusError = InvalidStatusError;