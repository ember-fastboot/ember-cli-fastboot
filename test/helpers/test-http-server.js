'use strict';

const express            = require('express');
const request            = require('request-promise');
const fastbootMiddleware = require('./../../src/index');

let serverID = 0;

class TestHTTPServer {
  constructor(middleware, options) {
    this.options = options || {};
    this.middleware = middleware;
    this.listener = null;
    this.id = ++serverID;
  }

  start() {
    let options = this.options;
    let app = express();

    app.get('/*', this.middleware);

    if (options.errorHandling) {
      app.use((err, req, res, next) => {
        res.set('x-test-error', 'error handler called');
        next(err);
      });
    }

    if (options.recoverErrors) {
      app.use((err, req, res, next) => {
        res.set('x-test-recovery', 'recovered response');
        res.status(200);
        res.send('hello world');
      });
    }

    return new Promise((resolve, reject) => {
      let port = options.port || 3000;
      let host = options.host || 'localhost';

      let listener = app.listen(port, host, () => {
        let host = listener.address().address;
        let port = listener.address().port;
        let family = listener.address().family;

        this.listener = listener;
        this.info = {
          host: host,
          port: port,
          listener: listener
        };

        resolve(this.info);
      });
    });
  }

  request(urlPath, options) {
    let info = this.info;
    let url = 'http://[' + info.host + ']:' + info.port;

    if (options && options.resolveWithFullResponse) {
      return request({
        resolveWithFullResponse: options.resolveWithFullResponse,
        uri: url + urlPath
      });
    }

    return request(url + urlPath);
  }

  stop() {
    if (this.listener) {
      this.listener.close();
    }
  }
}

module.exports = TestHTTPServer;
