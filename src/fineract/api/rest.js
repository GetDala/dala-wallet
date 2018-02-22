'use strict';

const _ = require('lodash');
const request = require('request');

module.exports = {
    get: (path, params) => {
        const urlPath = process.env.FINERACT_API_ENDPOINT_BASE;
        const url = `${urlPath}/${path}`;
        return new Promise((resolve, reject) => {
            request({
                url,
                json: true,
                qs: params
            }, (error, response, body) => {
                if (error) return reject(error);
                console.log(body);
                const json = body;
                if((json.status && json.status >= 300)||(json.httpStatusCode && json.httpStatusCode >= 300)) return reject(json);
                return resolve(json);
            });
        });
    },
    patch: (path, payload, params) => {
        const urlPath = process.env.FINERACT_API_ENDPOINT_BASE;
        const url = `${urlPath}/${path}`;
        console.log(url);
        return new Promise((resolve, reject) => {
            request({
                url,
                method: 'PATCH',
                body: payload,
                json: true,
                qs: params
            }, (error, response, body) => {
                if (error) return reject(error);
                console.log(body);
                const json = body;
                if((json.status && json.status >= 300)||(json.httpStatusCode && json.httpStatusCode >= 300)) return reject(json);
                return resolve(json);
            })
        });
    },
    put: (path, payload, params) => {
        const urlPath = process.env.FINERACT_API_ENDPOINT_BASE;
        const url = `${urlPath}/${path}`;
        console.log(url);
        return new Promise((resolve, reject) => {
            request({
                url,
                method: 'PUT',
                body: payload,
                json: true,
                qs: params
            }, (error, response, body) => {
                if (error) return reject(error);
                console.log(body);
                const json = body;
                if((json.status && json.status >= 300)||(json.httpStatusCode && json.httpStatusCode >= 300)) return reject(json);
                return resolve(json);
            })
        });
    },
    post: (path, payload, params) => {
        const urlPath = process.env.FINERACT_API_ENDPOINT_BASE;
        const url = `${urlPath}/${path}`;
        return new Promise((resolve, reject) => {
            request({
                url,
                method: 'POST',
                body: payload,
                json: true,
                qs: params
            }, (error, response, body) => {
                if (error) return reject(error);
                const json = body;
                if((json.status && json.status >= 300)||(json.httpStatusCode && json.httpStatusCode >= 300)) return reject(json);
                return resolve(json);
            })
        });
    }
}