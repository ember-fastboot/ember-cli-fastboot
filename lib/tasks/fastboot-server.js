'use strict';

const RSVP = require('rsvp');
const CoreObject = require('core-object');
const debug = require('debug')('ember-cli-fastboot/server');
const exec = RSVP.denodeify(require('child_process').exec);
const http = require('http');
const path = require('path');

module.exports = CoreObject.extend({

  exec,
  http,
  httpServer: null,
  nextSocketId: 0,
  require,
  restartAgain: false,
  restartPromise: null,
  sockets: {},

  run(options) {
    debug('run');
    const restart = () => this.restart(options);
    this.addon.on('outputReady', restart);
  },

  start(options) {
    debug('start');
    this.ui.writeLine('Installing FastBoot npm dependencies');

    return this.exec('npm install', { cwd: options.outputPath })
      .then(() => {
        const middleware = this.require('fastboot-express-middleware')(options.outputPath);
        const express = this.require('express');
        const app = express();

        if (options.serveAssets) {
          app.get('/', middleware);
          app.use(express.static(options.assetsPath));
        }
        app.get('/*', middleware);
        app.use((req, res) => res.sendStatus(404));

        this.httpServer = this.http.createServer(app);

        // Track open sockets for fast restart
        this.httpServer.on('connection', (socket) => {
          const socketId = this.nextSocketId++;
          debug(`open socket ${socketId}`);
          this.sockets[socketId] = socket;
          socket.on('close', () => {
            debug(`close socket ${socketId}`);
            delete this.sockets[socketId];
          });
        });

        return new RSVP.Promise((resolve, reject) => {
          this.httpServer.listen(options.port, options.host, (err) => {
            if (err) { return reject(err); }
            const o = this.httpServer.address();
            const port = o.port;
            const family = o.family;
            let host = o.address;
            if (family === 'IPv6') { host = `[${host}]`; }
            this.ui.writeLine(`Ember FastBoot running at http://${host}:${port}`);
            resolve();
          });
        });
      });
  },

  stop() {
    debug('stop');
    return new RSVP.Promise((resolve, reject) => {
      if (!this.httpServer) { return resolve(); }

      // Stop accepting new connections
      this.httpServer.close((err) => {
        debug('close', Object.keys(this.sockets));
        if (err) { return reject(err); }
        this.httpServer = null;
        resolve();
      });

      // Force close existing connections
      Object.keys(this.sockets).forEach(k => this.sockets[k].destroy());
    });
  },

  restart(options) {
    if (this.restartPromise) {
      debug('schedule immediate restart');
      this.restartAgain = true;
      return;
    }
    debug('restart');
    this.restartPromise = this.stop()
      .then(() => this.clearRequireCache(options.outputPath))
      .then(() => this.start(options))
      .catch(e => this.ui.writeLine(e))
      .finally(() => {
        this.restartPromise = null;
        if (this.restartAgain) {
          debug('restart again')
          this.restartAgain = false;
          this.restart(options);
        }
      });
    return this.restartPromise;
  },

  clearRequireCache: function (serverRoot) {
    debug('clearRequireCache');
    let absoluteServerRoot = path.resolve(serverRoot);
    if (absoluteServerRoot.slice(-1) !== path.sep) {
      absoluteServerRoot += path.sep;
    }
    Object.keys(require.cache).forEach(function (key) {
      if (key.indexOf(absoluteServerRoot) === 0) {
        delete require.cache[key];
      }
    });
  }
});
