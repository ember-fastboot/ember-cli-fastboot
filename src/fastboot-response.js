'use strict';

var FastBootHeaders = require('./fastboot-headers');

class FastbootResponse {
  constructor(response) {
    this.headers = new FastBootHeaders(response._headers);
    this.statusCode = 200;
  }
}

module.exports = FastbootResponse;
