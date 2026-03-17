'use strict';

const path = require('path');
const FastBootAppServer = require('../../src/fastboot-app-server');

const MY_GLOBAL = 'MY GLOBAL';

class DownloaderNotifier {
  constructor(options) {
    this.distPath = options.distPath;
    this.subscriptions = [];
  }

  subscribe(handler) {
    this.subscriptions.push(handler);
    return Promise.resolve();
  }

  trigger() {
    this.distPath = path.resolve(__dirname, './global-app');
    this.subscriptions.forEach(handler => {
      handler();
    });
  }

  download() {
    return Promise.resolve(this.distPath);
  }
}

const connector = new DownloaderNotifier({
  distPath: path.resolve(__dirname, './basic-app')
});

var server = new FastBootAppServer({
  notifier: connector,
  downloader: connector,
  buildSandboxGlobals(defaultGlobals) {
    return Object.assign({}, defaultGlobals, { THE_GLOBAL: MY_GLOBAL });
  }
});

const serverPromise = server.start();

// Don't run this on worker threads.
if (serverPromise) {
  serverPromise.then(() => {
    connector.trigger();
  });
}
