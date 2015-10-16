/*globals najax, Ember*/
var nodeAjax = function(url, type, options) {
  var adapter = this;

  return new Ember.RSVP.Promise(function(resolve, reject) {
    var hash = adapter.ajaxOptions(url, type, options);

    hash.success = function(json, textStatus, jqXHR) {
      json = adapter.ajaxSuccess(jqXHR, json);
      Ember.run(null, resolve, json);
    };

    hash.error = function(jqXHR, textStatus, errorThrown) {
      Ember.run(null, reject, adapter.ajaxError(jqXHR, jqXHR.responseText, errorThrown));
    };

    najax(hash);
  }, 'DS: RESTAdapter#ajax ' + type + ' to ' + url);
};

export default {
  name: 'ajax-service',

  initialize: function(application) {
    application.register('ajax:node', nodeAjax, { instantiate: false });
    application.inject('adapter', 'ajax', 'ajax:node');
  }
};
