var cookie = require('cookie');
var FastBootHeaders = require('./fastboot-headers');

function FastBootRequest(request, hostWhitelist) {
  this.hostWhitelist = hostWhitelist;

  this.protocol = request.protocol;
  this.headers = new FastBootHeaders(request.headers);
  this.queryParams = request.query;
  this.path = request.url;

  this.cookies = this.extractCookies(request);
}

FastBootRequest.prototype.host = function() {
  if (!this.hostWhitelist) {
    throw new Error('You must provide a hostWhitelist to retrieve the host');
  }

  var host = this.headers.get('host');

  var matchFound = this.hostWhitelist.reduce(function(previous, currentEntry) {
    if (currentEntry[0] === '/' &&
        currentEntry.slice(-1) === '/') {
      // RegExp as string
      var regexp = new RegExp(currentEntry.slice(1, -1));

      return previous || regexp.test(host);
    } else {
      return previous || currentEntry === host;
    }
  }, false);

  if (!matchFound) {
    throw new Error(`The host header did not match a hostWhitelist entry. Host header: ${host}`);
  }

  return host;
};

FastBootRequest.prototype.extractCookies = function(request) {
  // If cookie-parser middleware has already parsed the cookies,
  // just use that.
  if (request.cookies) {
    return request.cookies;
  }

  // Otherwise, try to parse the cookies ourselves, if they exist.
  var cookies = request.get('cookie');
  if (cookies) {
    return cookie.parse(cookies);
  }

  // Return an empty object instead of undefined if no cookies are present.
  return {};
};

module.exports = FastBootRequest;
