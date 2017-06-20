'use strict';

const FastBootAppServer = require('../../src/fastboot-app-server');

var server = new FastBootAppServer({
  downloader: {
    download: function() {
      return Promise.resolve();
    }
  }
});

server.start();
