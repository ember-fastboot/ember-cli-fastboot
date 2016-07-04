"use strict";

const FastBoot           = require('fastboot');
const fastbootMiddleware = require('fastboot-express-middleware');
const ExpressHTTPServer  = require('./express-http-server');

class Worker {
  constructor(options) {
    this.distPath = options.distPath;
    this.httpServer = options.httpServer;
    this.ui = options.ui;
    this.cache = options.cache;
    this.gzip = options.gzip || false;
    
    if (!this.httpServer) {
      this.httpServer = new ExpressHTTPServer({
        ui: this.ui,
        distPath: this.distPath,
        cache: this.cache
      });
    }

    if (!this.httpServer.cache) { this.httpServer.cache = this.cache; }
    if (!this.httpServer.distPath) { this.httpServer.distPath = this.distPath; }
    if (!this.httpServer.ui) { this.httpServer.ui = this.ui; }    
  }

  start() {
    if (!this.distPath) {
      this.middleware = this.noAppMiddleware();
    } else {
      this.middleware = this.buildMiddleware();
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
        this.fastboot.reload();
        break;
      case 'error':
        this.error = message.error;
        break;
      case 'shutdown':
        process.exit(0);
        break;
    }
  }

  buildMiddleware() {
    this.fastboot = new FastBoot({
      distPath: this.distPath,
      resilient: true
    });

    return fastbootMiddleware({
      fastboot: this.fastboot
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

module.exports = Worker;
