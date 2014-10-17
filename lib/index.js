/**
 * Workground for fix Error: DEPTH_ZERO_SELF_SIGNED_CERT
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * Module dependencies.
 */

var WebSocket = require('ws'),
    request = require('request');

/**
 * Private methods
 */

var loginRequest = function (params, callback) {
    request({
        method: 'POST',
        url: 'http' + (params.endpoints.ssl ? 's' : '') + '://' + params.endpoints.login + '/oauth/token',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Basic Y2Y6',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
            'grant_type': 'password',
            'username': params.username,
            'password': params.password
        }
    }, function (error, response, body) {
        body = JSON.parse(body);
        return callback(error, body);
    });
};

/**
 * Public methods
 */

exports = module.exports = {
    recent: function (params, callback) {
        loginRequest(params, function (error, data) {
            request({
                method: 'GET',
                url: 'http' + (params.endpoints.ssl ? 's' : '') + '://' + params.endpoints.loggregator + '/recent?app=' + params.appGuid,
                headers: {
                    'Authorization': data.token_type + ' ' + data.access_token
                }
            }, function (error, response, body) {
                return callback(error, body);
            });
        });
    },
    tail: function (params, callback) {
        loginRequest(params, function (error, data) {
            var ws = new WebSocket('ws' + (params.endpoints.ssl ? 's' : '') + '://' + params.endpoints.loggregator + ':4443/tail/?app=' + params.appGuid, {
                headers: {
                    'Authorization': data.token_type + ' ' + data.access_token
                }
            });
            return callback(ws);
        });
    }
};