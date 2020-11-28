"use strict";

const express = require('express');
const basicAuth = require('./basic-auth');

function noop() {}

class ExpressHTTPServer {
  constructor(options) {
    options = options || {};

    this.ui = options.ui;
    this.distPath = options.distPath;
    this.username = options.username;
    this.password = options.password;
    this.cache = options.cache;
    this.gzip = options.gzip || false;
    this.host = options.host;
    this.port = options.port;
    this.beforeMiddleware = options.beforeMiddleware || noop;
    this.afterMiddleware = options.afterMiddleware || noop;

    this.app = express();
  }

  serve(fastbootMiddleware) {
    let app = this.app;
    let username = this.username;
    let password = this.password;

    this.beforeMiddleware(app);

    if (this.gzip) {
      this.app.use(require('compression')());
    }

    if (username !== undefined || password !== undefined) {
      this.ui.writeLine(`adding basic auth; username=${username}; password=${password}`);
      app.use(basicAuth(username, password));
    }

    if (this.cache) {
      app.get('/*', this.buildCacheMiddleware());
    }

    if (this.distPath) {
      app.get('/', fastbootMiddleware);
      app.use(express.static(this.distPath));
      app.get('/assets/*', function(req, res) {
        res.sendStatus(404);
      });
    }

    app.get('/*', fastbootMiddleware);

    this.afterMiddleware(app);

    return new Promise(resolve => {
      let listener = app.listen(this.port || process.env.PORT || 3000, this.host || process.env.HOST, () => {
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
