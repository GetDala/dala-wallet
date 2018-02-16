'use strict';

const Sub = 'sub';

function extractProperty(event, prop) {
    return event.requestContext.authorizer.claims[prop];
}

/**
 * Get the unique identifier (sub) for the user identified by the claims
 * @param {Object} event 
 */
module.exports.getSubFromEvent = (event) => {
    let sub = extractProperty(event, Sub);
    return sub;
}