'use strict';

class ItemDoesNotExistError extends Error {
    constructor(message){
        super(message);
        this.name = 'ItemDoesNotExistError';
    }
}

class TooManyItemsError extends Error {
    constructor(message){
        super(message);
        this.name = 'TooManyItemsError';
    }
}

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

class InvalidUserAddressCombinationError extends Error {
    constructor(message){
        super(message);
        this.name = 'InvalidUserAddressCombinationError';
    }
}

module.exports.ItemDoesNotExistError = ItemDoesNotExistError;
module.exports.TooManyItemsError = TooManyItemsError;
module.exports.ItemAlreadyExistsError = ItemAlreadyExistsError;
module.exports.InvalidStatusError = InvalidStatusError;
module.exports.MissingParameterError = MissingParameterError;
module.exports.InvalidUserAddressCombinationError = InvalidUserAddressCombinationError;