'use strict';

const runServer = require('./run-server');
const killCliProcess = require('./kill-cli-process');

let server;

const startServer = async (options) =>  {
  const result = await runServer(options);

  server = result.server;

  return result;
};

const stopServer = () => {
  if (!server) {
    throw new Error('You must call `startServer()` before calling `stopServer()`.');
  }

  killCliProcess(server);

  server = null;
};

module.exports = {
  startServer,
  stopServer,
}
