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
    this.gzip = options.gzip;
    this.host = options.host;
    this.port = options.port;
    this.username = options.username;
    this.password = options.password;
    this.beforeMiddleware = options.beforeMiddleware;
    this.afterMiddleware = options.afterMiddleware;
    this.buildSandboxGlobals = options.buildSandboxGlobals;
    this.chunkedResponse = options.chunkedResponse;
    this.log = options.log;

    if (!this.httpServer) {
      this.httpServer = new ExpressHTTPServer({
        ui: this.ui,
        distPath: this.distPath,
        cache: this.cache,
        gzip: this.gzip,
        host: this.host,
        port: this.port,
        username: this.username,
        password: this.password,
        beforeMiddleware: this.beforeMiddleware,
        afterMiddleware: this.afterMiddleware,
        buildSandboxGlobals: options.buildSandboxGlobals,
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
        this.distPath = message.distPath || this.distPath;
        this.ui.writeLine('Reloading the application from distPath:', this.distPath);
        this.fastboot.reload({ distPath: this.distPath });
        break;
      case 'error':
        this.error = message.error;
        break;
      case 'shutdown':
        process.exit(0); // eslint-disable-line no-process-exit
    }
  }

  buildMiddleware() {
    this.fastboot = new FastBoot({
      distPath: this.distPath,
      buildSandboxGlobals: this.buildSandboxGlobals,
    });

    return fastbootMiddleware({
      fastboot: this.fastboot,
      chunkedResponse: this.chunkedResponse,
      log: this.log,
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
