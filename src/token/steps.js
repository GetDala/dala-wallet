'use strict';

const DalaTransfer = require('./DalaTransfer');

module.exports.transferProcessing = (event, context) => {
    const transfer = new DalaTransfer(event.id);
    transfer.processing().then(context.succeed).catch(context.fail);
}

module.exports.transferComplete = (event, context) => {
    const transfer = new DalaTransfer(event.id);
    transfer.complete().then(context.succeed).catch(context.fail);
}

module.exports.transferFailed = (event, context) => {
    const transfer = new DalaTransfer(event.id);
    transfer.failed().then(context.succeed).catch(context.fail);
}