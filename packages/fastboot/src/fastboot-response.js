'use strict';

const FastBootHeaders = require('./fastboot-headers');

class FastbootResponse {
  constructor(response) {
    this.headers = new FastBootHeaders(
      typeof response.getHeaders === 'function' ? response.getHeaders() : response._headers
    );
    this.statusCode = 200;
  }
}

module.exports = FastbootResponse;
