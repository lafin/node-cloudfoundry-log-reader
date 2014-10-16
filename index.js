// workground for Error: DEPTH_ZERO_SELF_SIGNED_CERT
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var WebSocket = require('ws'),
    request = require('request');

var params = {
    username: 'username',
    password: 'password',
    appsGuid: 'd95a3037-cdba-4de2-a64e-eecbee406b62',
    endpoints: {
        loggregator: 'loggregator.cf-domain.com',
        login: 'login.cf-domain.com'
    }
};

function loginRequest(params, callback) {
    request({
        method: 'POST',
        url: 'http://' + params.endpoints.login + '/oauth/token',
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
}

function recentLog(params, callback) {
    loginRequest(params, function (error, data) {
        request({
            method: 'GET',
            url: 'https://' + params.endpoints.loggregator + '/recent?app=' + params.appsGuid,
            headers: {
                'Authorization': data.token_type + ' ' + data.access_token
            }
        }, function (error, response, body) {
            return callback(error, body);
        });
    });
}

function tailLog(params, callback) {
    loginRequest(params, function (error, data) {
        var ws = new WebSocket('wss://' + params.endpoints.loggregator + ':4443/recent/?app=' + params.appsGuid, {
            headers: {
                'Authorization': data.token_type + ' ' + data.access_token
            }
        });
        ws.on('open', function () {
            console.log('connected');
        });
        ws.on('close', function () {
            console.log('disconnected');
        });
        ws.on('message', function (data) {
            console.log(data.toString());
        });
        ws.on('error', function () {
            console.log(arguments);
        });
    });
}

recentLog(params, function (error, data) {
    console.log(data);
});

tailLog(params, function (error, data) {
    console.log(data);
});