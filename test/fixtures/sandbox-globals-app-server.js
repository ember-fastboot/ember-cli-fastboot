'use strict';

var path = require('path');
const FastBootAppServer = require('../../src/fastboot-app-server');

const MY_GLOBAL = 'MY GLOBAL';

var server = new FastBootAppServer({
  distPath: path.resolve(__dirname, './global-app'),
  sandboxGlobals: { THE_GLOBAL: MY_GLOBAL }
});

server.start();
