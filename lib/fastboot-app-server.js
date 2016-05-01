"use strict";

const assert           = require('assert');
const cluster          = require('cluster');
const os               = require('os');
const path             = require('path');

const WORKER_PATH = path.join(__dirname, './worker.js');

class FastBootAppServer {
  constructor(options) {
    options = options || {};

    this.downloader = options.downloader;
    this.distPath = options.distPath;
    this.notifier = options.notifier;
    this.workerCount = options.workerCount || os.cpus().length;
    this.ui = options.ui;

    if (!this.ui) {
      let UI = require('./ui');
      this.ui = new UI();
      this.propagateUI();
    }

    assert(this.distPath || this.downloader, "FastBootAppServer must be provided with either a distPath or a downloader option.");
    assert(!(this.distPath && this.downloader), "FastBootAppServer must be provided with either a distPath or a downloader option, but not both.");
  }

  start() {
    return this.initializeApp()
      .then(() => this.subscribeToNotifier())
      .then(() => this.forkWorkers())
      .then(() => {
        if (this.initializationError) {
          this.broadcast({ event: 'error', error: this.initializationError.stack });
        }
      })
      .catch(err => {
        this.ui.writeLine(err.stack);
      });
  }

  propagateUI() {
    if (this.downloader) { this.downloader.ui = this.ui; }
    if (this.notifier) { this.notifier.ui = this.ui; }
  }

  initializeApp() {
    // If there's a downloader, it returns a promise for downloading the app
    if (this.downloader) {
      return this.downloadApp()
        .catch(err => {
          this.ui.writeLine('Error downloading app');
          this.ui.writeLine(err.stack);
          this.initializationError = err;
        });
    }

    this.ui.writeline(`using distPath; path=${this.distPath}`);

    return Promise.resolve();
  }

  downloadApp() {
    this.ui.writeLine('downloading app');

    return this.downloader.download()
      .then(distPath => {
        this.distPath = distPath;
      })
      .catch(err => {
        if (err.name.match(/AppNotFound/)) {
          this.ui.writeError('app not downloaded');
        } else {
          throw err;
        }
      });
  }

  subscribeToNotifier() {
    if (this.notifier) {
      this.ui.writeLine('subscribing to update notifications');

      return this.notifier.subscribe(() => {
        this.ui.writeLine('reloading server');
        this.initializeApp()
          .then(() => this.reload());
      })
      .catch(err => {
        this.ui.writeLine('Error subscribing');
        this.ui.writeLine(err.stack);
        this.initializationError = err;
      });
    }
  }

  broadcast(message) {
    let workers = cluster.workers;

    for (let id in workers) {
      workers[id].send(message);
    }
  }

  reload() {
    this.broadcast({ event: 'reload' });
  }

  forkWorkers() {
    let promises = [];

    for (let i = 0; i < this.workerCount; i++) {
      promises.push(this.forkWorker());
    }

    return Promise.all(promises);
  }

  forkWorker() {
    cluster.setupMaster({
      exec: WORKER_PATH
    });

    let env = this.buildWorkerEnv();
    let worker = cluster.fork(env);

    this.ui.writeLine(`forked worker ${worker.process.pid}`);

    worker.on('exit', (code, signal) => {
      if (signal) {
        this.ui.writeLine(`worker was killed by signal: ${signal}`);
      } else if (code !== 0) {
        this.ui.writeLine(`worker exited with error code: ${code}`);
      } else {
        this.ui.writeLine(`worker exited`);
      }

      this.forkWorker();
    });

    return new Promise(resolve => {
      this.ui.writeLine('worker online');
      worker.on('message', message => {
        if (message.event === 'http-online') {
          resolve();
        }
      });
    });
  }

  buildWorkerEnv() {
    let env = {};

    if (this.distPath) {
      env.FASTBOOT_DIST_PATH = this.distPath;
    }

    return env;
  }

}

module.exports = FastBootAppServer;
