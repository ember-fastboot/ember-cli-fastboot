'use strict';

var path = require('path');
var alchemistRequire = require('broccoli-module-alchemist/require');
var FastBootAppServer = alchemistRequire('fastboot-app-server');

function setXTestHeader(err, req, res, next) {
  res.set('x-test-header', 'testing')
  next();
}

var server = new FastBootAppServer({
  distPath: path.resolve(__dirname, './broken-app'),
  afterMiddleware: function (app) {
    app.use(setXTestHeader);
  },
  resilient: true,
});

server.start();
