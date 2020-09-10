'use strict';

const runServer = require('./run-server');
const killCliProcess = require('./kill-cli-process');

let server;
let longRunningServerPromise;

const startServer = function(options) {
  return runServer(options)
    .then(result => {
      server = result.server;
      longRunningServerPromise = result.longRunningServerPromise;
    });
};

const stopServer = function() {
  if (!server) {
    throw new Error('You must call `startServer()` before calling `stopServer()`.');
  }

  killCliProcess(server);

  return longRunningServerPromise.catch(() => {
    server = null;
  });
};

module.exports = {
  startServer,
  stopServer,
}
