'use strict';

const Sub = 'sub';
const CognitoUsername = 'cognito:username';

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

/**
 * Get the username for the user identified by the claims
 * @param {Object} event 
 */
module.exports.getUsernameFromEvent = (event) => {
    let username = extractProperty(event, CognitoUsername);
    return username;
}