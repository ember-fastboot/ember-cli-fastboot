var FastBootHeaders = require('./fastboot-headers');

function FastbootResponse(response) {
  this.headers = new FastBootHeaders(response._headers);
  this.statusCode = 200;
}

module.exports = FastbootResponse;
