var cookie = require('cookie');

/*
 * A class that encapsulates information about the
 * current HTTP request from FastBoot. This is injected
 * on to the FastBoot service.
 */
function FastBootInfo(request, response) {
  this.request = request;
  this.response = response;

  this.cookies = this.extractCookies(request);
  this.headers = request.headers;
}

FastBootInfo.prototype.extractCookies = function(request) {
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

/*
 * Registers this FastBootInfo instance in the registry of an Ember
 * ApplicationInstance. It is configured to be injected into the FastBoot
 * service, ensuring it is available inside instance initializers.
 */
FastBootInfo.prototype.register = function(instance) {
  instance.register('info:-fastboot', this, { instantiate: false });
  instance.inject('service:fastboot', '_fastbootInfo', 'info:-fastboot');
};

module.exports = FastBootInfo;
