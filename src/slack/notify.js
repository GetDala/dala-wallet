'use strict';
const request = require('request');
const _ = require('lodash');
var zlib = require('zlib');
var async = require('async');
const moment = require('moment');
var bunyan = require('bunyan');
var loggerDefinition = {
    serializers: { error: bunyan.stdSerializers.err }
}
var log = bunyan.createLogger(loggerDefinition);

module.exports.notify = function (event, context, callback) {
    var slackUrl = process.env.SLACK.concat(process.env.SLACK_WEBHOOK);
    var payload = new Buffer(event.awslogs.data, 'base64');
    zlib.gunzip(payload, (error, logs) => {
        if (error) {
            log.error({ error, event }, 'error occurred unzipping the message');
            return callback(error);
        }
        logs = JSON.parse(logs.toString('ascii'));
        var messages = _.map(logs.logEvents, parseLogs);
        async.each(messages, function (message, slackCallback) {
            if (message) {
                request.post(slackUrl,
                    {
                        form: {
                            payload: JSON.stringify(message)
                        }
                    }, (error, response, body) => {
                        log.info({ body }, 'response body');
                        if (error) {
                            log.error({ error, event }, error.message);
                            return slackCallback(error);
                        }
                        return slackCallback();
                    }
                );
            }
            else {
                return slackCallback();
            }
        }, function (error) {
            if (error) {
                log.error({ error }, error.message);
                return callback(error);
            }
            return callback()
        });

        function parseLogs(logEvent) {
            var slackMessage = {};
            try {
                var tempMessage = JSON.parse(logEvent.message);
                slackMessage.username = tempMessage.name;
                slackMessage.text = tempMessage.msg;
                slackMessage.icon_url = 'https://avatars1.githubusercontent.com/u/24389055?v=3&u=179e054d81d8bf05457a72e66a295356bc32ec4a&s=400';
                slackMessage.attachments = [
                    {
                        "color": "danger",
                        "fallback": tempMessage.msg,
                        "fields": [
                            {
                                "title": "time",
                                "value": moment(tempMessage.time).toString(),
                                "short": false
                            },
                            {
                                "title": "source-file",
                                "value": tempMessage.src.file,
                                "short": false
                            },
                            {
                                "title": "source-func",
                                "value": tempMessage.src.func,
                                "short": false
                            },
                            {
                                "title": "source-line",
                                "value": tempMessage.src.line,
                                "short": false
                            },
                            {
                                "title": "cloudWatch-url",
                                "value": getLogURL(),
                                "short": false
                            }
                        ]
                    }
                ];

                if (tempMessage.error) {
                    slackMessage.attachments.push({
                        "color": "danger",
                        "fallback": "Error Message",
                        "fields": [
                            {
                                "title": "error",
                                "value": JSON.stringify(tempMessage.error),
                                "short": false
                            }
                        ]
                    })
                }
                return slackMessage;
            }
            catch (error) {
                log.error({ error }, error.message);
                slackMessage.text = logEvent.message;
                slackMessage.username = 'Error';
                slackMessage.icon_url = 'https://avatars1.githubusercontent.com/u/24389055?v=3&u=179e054d81d8bf05457a72e66a295356bc32ec4a&s=400';
                return slackMessage;
            }
        }
        function getLogURL() {
            return `https://${process.env.AWS_REGION}.console.aws.amazon.com/cloudwatch/home?region=${process.env.AWS_REGION}#logEventViewer:group=${logs.logGroup};stream=${logs.logStream}`
        }
    });
}

