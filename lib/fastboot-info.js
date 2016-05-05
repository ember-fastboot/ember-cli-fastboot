var RSVP = require('rsvp');
var FastBootRequest = require('./fastboot-request');
var FastBootResponse = require('./fastboot-response');

/*
 * A class that encapsulates information about the
 * current HTTP request from FastBoot. This is injected
 * on to the FastBoot service.
 */
function FastBootInfo(request, response, hostWhitelist) {
  this.deferredPromise = RSVP.resolve();
  if (request) {
    this.request = new FastBootRequest(request, hostWhitelist);
  }

  this.response = new FastBootResponse(response || {});
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
