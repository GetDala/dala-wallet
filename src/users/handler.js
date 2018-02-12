'use strict';

module.exports.register = (event, context, callback) => {
    console.log(JSON.stringify(event));
    return context.succeed({
        statusCode: 200,
        body: JSON.stringify({ "message": "WHOOP WHOOP!" })
    });
}