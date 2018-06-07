'use strict';

const _ = require('lodash');
const request = require('request');

class ApiError extends Error {
  constructor(statusCode, statusMessage, body) {
    super(`${statusCode}:${statusMessage}`);
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
    this.body = body;
    this.name = 'ApiError';
  }
}

module.exports = {
  get: (path, params) => {
    const urlPath = process.env.FINERACT_API_ENDPOINT_BASE;
    const url = `${urlPath}/${path}`;
    return new Promise((resolve, reject) => {
      request(
        {
          url,
          json: true,
          qs: params
        },
        (error, response, body) => {
          if (error) return reject(error);
          const json = body;
          if (response.statusCode >= 300 || (json.status && json.status >= 300) || (json.httpStatusCode && json.httpStatusCode >= 300))
            return reject(new ApiError(response.statusCode, response.statusMessage, body));
          return resolve(json);
        }
      );
    });
  },
  patch: (path, payload, params) => {
    const urlPath = process.env.FINERACT_API_ENDPOINT_BASE;
    const url = `${urlPath}/${path}`;
    return new Promise((resolve, reject) => {
      request(
        {
          url,
          method: 'PATCH',
          body: payload,
          json: true,
          qs: params
        },
        (error, response, body) => {
          if (error) return reject(error);
          console.log(body);
          const json = body;
          if (response.statusCode >= 300 || (json.status && json.status >= 300) || (json.httpStatusCode && json.httpStatusCode >= 300))
            return reject(new ApiError(response.statusCode, response.statusMessage, body));
          return resolve(json);
        }
      );
    });
  },
  put: (path, payload, params) => {
    const urlPath = process.env.FINERACT_API_ENDPOINT_BASE;
    const url = `${urlPath}/${path}`;
    return new Promise((resolve, reject) => {
      request(
        {
          url,
          method: 'PUT',
          body: payload,
          json: true,
          qs: params
        },
        (error, response, body) => {
          if (error) return reject(error);
          console.log(body);
          const json = body;
          if (response.statusCode >= 300 || (json.status && json.status >= 300) || (json.httpStatusCode && json.httpStatusCode >= 300))
            return reject(new ApiError(response.statusCode, response.statusMessage, body));
          return resolve(json);
        }
      );
    });
  },
  post: (path, payload, params) => {
    const urlPath = process.env.FINERACT_API_ENDPOINT_BASE;
    const url = `${urlPath}/${path}`;
    return new Promise((resolve, reject) => {
      request(
        {
          url,
          method: 'POST',
          body: payload,
          json: true,
          qs: params
        },
        (error, response, body) => {
          if (error) return reject(error);
          const json = body;
          if (response.statusCode >= 300 || (json.status && json.status >= 300) || (json.httpStatusCode && json.httpStatusCode >= 300))
            return reject(new ApiError(response.statusCode, response.statusMessage, body));
          return resolve(json);
        }
      );
    });
  }
};
