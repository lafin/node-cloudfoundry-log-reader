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

var cleanBinaryData = function (data) {
    data = data.split('\n\n');
    data.splice(0, 1);
    var length = data.length;
    for (var i = 0; i < length; i++) {
        var value = data[i];
        value = value.substr(1, value.length - 1);
        var end = value.indexOf(String.fromCharCode(16));
        value = value.substr(0, end);
    }
    return data.join('\n\n');
};

/**
 * Public methods
 */

exports = module.exports = {
    recent: function (params, callback) {
        var clean = params.clean || false;
        var proto = 'http' + (params.endpoints.ssl ? 's' : '');
        loginRequest(params, function (error, data) {
            request({
                method: 'GET',
                url: proto + '://' + params.endpoints.loggregator + '/recent?app=' + params.appGuid,
                headers: {
                    'Authorization': data.token_type + ' ' + data.access_token
                }
            }, function (error, response, body) {
                if (clean) {
                    body = cleanBinaryData(body);
                }
                return callback(error, body);
            });
        });
    },
    tail: function (params, callback) {
        var port = params.endpoints.port || 4443,
            proto = 'ws' + (params.endpoints.ssl ? 's' : '');
        loginRequest(params, function (error, data) {
            var ws = new WebSocket(proto + '://' + params.endpoints.loggregator + ':' + port + '/tail/?app=' + params.appGuid, {
                headers: {
                    'Authorization': data.token_type + ' ' + data.access_token
                }
            });
            return callback(ws);
        });
    }
};