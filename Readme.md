### Simple library for read log cloud foundry apps
___

### Installation

```bash
$ npm install node-cloudfoundry-log-reader
```

### Example
```js
var cf = require('node-cloudfoundry-log-reader');

var params = {
    username: 'username',
    password: 'password',
    appGuid: 'guid',
    endpoints: {
        loggregator: 'loggregator.cf-domain.com',
        login: 'login.cf-domain.com',
        ssl: true
    }
};

/**
 * Example: cf logs app-name --recent
 */

cf.recent(params, function (error, data) {
    console.log(data);
});

/**
 * Example: cf logs app-name
 */

cf.tail(params, function (socket) {
    socket.on('open', function () {
        console.log('connected');
    });
    socket.on('close', function () {
        console.log('disconnected');
    });
    socket.on('message', function (data) {
        console.log(data.toString());
    });
    socket.on('error', function () {
        console.log(arguments);
    });
});
```

### More Information

* [Streaming logs](http://docs.run.pivotal.io/devguide/deploy-apps/streaming-logs.html)


### Contributors

 * Author: [lafin](https://github.com/lafin)

### License

  [MIT](LICENSE)
