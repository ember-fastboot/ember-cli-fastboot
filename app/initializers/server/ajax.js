/* globals najax */

var nodeAjax = function(options) {
  najax(options);
};

export default {
  name: 'ajax-service',

  initialize: function(application) {
    application.register('ajax:node', nodeAjax, { instantiate: false });
    application.inject('adapter', '_ajaxRequest', 'ajax:node');
  }
};
