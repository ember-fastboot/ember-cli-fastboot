"use strict";

const express = require('express');
const basicAuth = require('./basic-auth');

class ExpressHTTPServer {
  constructor(options) {
    options = options || {};

    this.ui = options.ui;
    this.distPath = options.distPath;
    this.username = options.username;
    this.password = options.password;
    this.cache = options.cache;
    this.gzip = options.gzip || false;

    this.app = express();
    if (options.gzip) {
      this.app.use(require('compression')());
    }
  }

  serve(middleware) {
    let app = this.app;
    let username = this.username;
    let password = this.password;

    if (username !== undefined || password !== undefined) {
      this.ui.writeLine(`adding basic auth; username=${username}; password=${password}`);
      app.use(basicAuth(username, password));
    }

    if (this.cache) {
      app.get('/*', this.buildCacheMiddleware());
    }

    if (this.distPath) {
      app.get('/', middleware);
      app.use(express.static(this.distPath));
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

  buildCacheMiddleware() {
    return (req, res, next) => {
      let path = req.path;

      Promise.resolve(this.cache.fetch(path, req))
        .then(response => {
          if (response) {
            this.ui.writeLine(`cache hit; path=${path}`);
            res.send(response);
          } else {
            this.ui.writeLine(`cache miss; path=${path}`);
            this.interceptResponseCompletion(path, res);
            next();
          }
        })
        .catch(() => next());
    };
  }

  interceptResponseCompletion(path, res) {
    let send = res.send.bind(res);

    res.send = (body) => {
      let ret = send(body);

      this.cache.put(path, body, res)
        .then(() => {
          this.ui.writeLine(`stored in cache; path=${path}`);
        })
        .catch(() => {
          let truncatedBody = body.replace(/\n/g).substr(0, 200);
          this.ui.writeLine(`error storing cache; path=${path}; body=${truncatedBody}...`);
        });

      res.send = send;

      return ret;
    };
  }
}

module.exports = ExpressHTTPServer;
