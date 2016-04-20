"use strict";

const express = require('express');
const basicAuth = require('./basic-auth');

class ExpressHTTPServer {
  constructor(options) {
    options = options || {};

    this.username = options.username;
    this.password = options.password;
    this.app = express();
    this.ui = options.ui;
  }

  serve(middleware) {
    let app = this.app;
    let username = this.username;
    let password = this.password;

    if (username !== undefined || password !== undefined) {
      this.ui.writeLine(`adding basic auth; username=${username}; password=${password}`);
      app.use(basicAuth(username, password));
    }

    app.get('/*', middleware);

    return new Promise(resolve => {
      let listener = app.listen(process.env.PORT || 3000, () => {
        let host = listener.address().address;
        let port = listener.address().port;

        this.ui.writeLine('HTTP server started; url=http://%s:%s', host, port);

        resolve();
      });
    });
  }
}

module.exports = ExpressHTTPServer;
