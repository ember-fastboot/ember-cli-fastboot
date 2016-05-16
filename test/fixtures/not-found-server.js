'use strict';

const FastBootAppServer = require('../../lib/fastboot-app-server.js');

let server = new FastBootAppServer({
  downloader: {
    download() {
      return Promise.resolve();
    }
  }
});

server.start();
