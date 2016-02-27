/* globals najax */
import Ember from 'ember';

const { get } = Ember;

var nodeAjax = function(options) {
  let httpRegex = /^https?:\/\//

  if (!httpRegex.test(options.url)) {
    try {
      options.url = get(this, 'fastboot.host') + options.url
    } catch (fbError) {
      throw new Error('You are using Ember Data with no host defined in your adapter. This will attempt to use the host of the FastBoot request, which is not configured for the current host of this request. Please set the hostWhitelist property for in your environment.js. FastBoot Error: ' + fbError.message);
    }
  }

  najax(options);
};

export default {
  name: 'ajax-service',

  initialize: function(application) {
    application.register('ajax:node', nodeAjax, { instantiate: false });
    application.inject('adapter', '_ajaxRequest', 'ajax:node');
    application.inject('adapter', 'fastboot', 'service:fastboot');
  }
};
