module.exports.ignore = (event, context)=>{
    return context.succeed({
        statusCode: 200,
        body: 'This should not be called'
    });
}