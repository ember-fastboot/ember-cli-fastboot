/*globals najax, FastBoot, Ember*/
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
  name: "ajax-service",

  initialize: function(registry, App) {
    // Detect if we're running in Node. If not, there's nothing to do.
    if (typeof document === 'undefined') {
      // This needs to be setting up renderer:main, and ideally would have a less hacked
      // up interface. In particular, the only ACTUAL swap-in here is the fake document,
      // so it would be nice if we could register just that.
      registry.register('ajax:node', {
        create: function() {
          return nodeAjax;
        }
      });

      registry.injection('adapter', 'ajax', 'ajax:node');

      FastBoot.resolve(function(url) {
        return App.visit(url).then(function(instance) {
          var view = instance.view;

          var element = view.renderToElement().firstChild;

          var serializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);
          return serializer.serialize(element);
        });
      });

      Ember.View.reopen({
        appendTo: function() { }
      });
    }
  }
};
