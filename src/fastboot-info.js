var RSVP = require('rsvp');
var FastBootRequest = require('./fastboot-request');
var FastBootResponse = require('./fastboot-response');

/*
 * A class that encapsulates information about the
 * current HTTP request from FastBoot. This is injected
 * on to the FastBoot service.
 *
 * @param {ClientRequest} the incoming request object
 * @param {ClientResponse} the response object
 * @param {Object} additional options passed to fastboot info
 * @param {Array} [options.hostWhitelist] expected hosts in your application
 * @param {Object} [options.metaData] per request meta data
 */
function FastBootInfo(request, response, options) {

  this.deferredPromise = RSVP.resolve();
  let { hostWhitelist, metadata } = options;
  if (request) {
    this.request = new FastBootRequest(request, hostWhitelist);
  }

  this.response = new FastBootResponse(response || {});
  this.metadata = metadata;
}

FastBootInfo.prototype.deferRendering = function(promise) {
  this.deferredPromise = this.deferredPromise.then(function() {
    return promise;
  });
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
