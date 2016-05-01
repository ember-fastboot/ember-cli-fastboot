"use strict";

const FastBootServer    = require('ember-fastboot-server');
const ExpressHTTPServer = require('./express-http-server');
const UI                = require('./ui');

class Worker {
  constructor(options) {
    this.distPath = options.distPath;
    this.httpServer = options.httpServer;
    this.ui = options.ui;

    if (!this.httpServer) {
      this.httpServer = new ExpressHTTPServer();
      this.httpServer.ui = this.ui;
    }
  }

  start() {
    if (!this.distPath) {
      this.middleware = this.noAppMiddleware();
    } else {
      this.buildServer();
      this.middleware = this.server.middleware();
    }

    this.bindEvents();
    this.serveHTTP();
  }

  bindEvents() {
    process.on('message', message => this.handleMessage(message));
  }

  handleMessage(message) {
    switch (message.event) {
      case 'reload':
        this.server.reload();
        break;
      case 'error':
        this.error = message.error;
        break;
    }
  }

  buildServer() {
    this.server = new FastBootServer({
      distPath: this.distPath,
      ui: this.ui
    });
  }

  serveHTTP() {
    this.ui.writeLine('starting HTTP server');
    return this.httpServer.serve(this.middleware)
      .then(() => {
        process.send({ event: 'http-online' });
      });
  }

  noAppMiddleware() {
    return (req, res) => {
      let html = '<h1>No Application Found</h1>';

      if (this.error) {
        html += '<pre style="color: red">' + this.error + '</pre>';
      }

      res.status(500).send(html);
    };
  }
}

let worker = new Worker({
  distPath: process.env.FASTBOOT_DIST_PATH || false,
  ui: new UI()
});

worker.start();
