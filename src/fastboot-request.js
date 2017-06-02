'use strict';

var cookie = require('cookie');
var FastBootHeaders = require('./fastboot-headers');

class FastBootRequest {
  constructor(request, hostWhitelist) {
    this.hostWhitelist = hostWhitelist;

    this.protocol = request.protocol;
    this.headers = new FastBootHeaders(request.headers);
    this.queryParams = request.query;
    this.path = request.url;
    this.method = request.method;
    this.body = request.body;

    this.cookies = this.extractCookies(request);
  }

  host() {
    if (!this.hostWhitelist) {
      throw new Error('You must provide a hostWhitelist to retrieve the host');
    }

    var host = this.headers.get('host');
    var matchFound = this.hostWhitelist.some(function(entry) {
      if (entry[0] === '/' && entry.slice(-1) === '/') {
        var regexp = new RegExp(entry.slice(1, -1));
        return regexp.test(host);
      } else {
        return entry === host;
      }
    });

    if (!matchFound) {
      throw new Error(`The host header did not match a hostWhitelist entry. Host header: ${host}`);
    }

    return host;
  }

  extractCookies(request) {
    // If cookie-parser middleware has already parsed the cookies,
    // just use that.
    if (request.cookies) {
      return request.cookies;
    }

    // Otherwise, try to parse the cookies ourselves, if they exist.
    var cookies = request.headers.cookie;
    if (cookies) {
      return cookie.parse(cookies);
    }

    // Return an empty object instead of undefined if no cookies are present.
    return {};
  }

}


module.exports = FastBootRequest;
