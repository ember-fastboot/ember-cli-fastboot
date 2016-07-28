'use strict';

var alchemistRequire = require('broccoli-module-alchemist/require');
var FastBootAppServer = alchemistRequire('fastboot-app-server.js');

var server = new FastBootAppServer({
  downloader: {
    download: function() {
      return Promise.resolve();
    }
  }
});

server.start();
