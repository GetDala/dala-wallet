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

class MissingParameterError extends Error {
    constructor(message, parameter){
        super(message);
        this.name = 'MissingParameterError';
        this.parameter = parameter;
    }
}

module.exports.ItemAlreadyExistsError = ItemAlreadyExistsError;
module.exports.InvalidStatusError = InvalidStatusError;
module.exports.MissingParameterError = MissingParameterError;