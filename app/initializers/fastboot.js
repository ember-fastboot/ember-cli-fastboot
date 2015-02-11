/*globals SimpleDOM, Ember, FastBoot, URL*/

export default {
  name: "fast-boot",

  initialize: function(registry, App) {
    // Detect if we're running in Node. If not, there's nothing to do.
    if (typeof document === 'undefined') {
      var doc = new SimpleDOM.Document();
      var domHelper = new Ember.View.DOMHelper(doc);

      domHelper.protocolForURL = function(url) {
        var protocol = URL.parse(url).protocol;
        return (protocol == null) ? ':' : protocol;
      };

      // Disable autobooting of the app. This will disable automatic routing,
      // and routing will only occur via our calls to visit().
      App.autoboot = false;

      // This needs to be setting up renderer:main, and ideally would have a less hacked
      // up interface. In particular, the only ACTUAL swap-in here is the fake document,
      // so it would be nice if we could register just that.
      registry.register('renderer:-dom', {
        create: function() {
          return new Ember.View._Renderer(domHelper, false);
        }
      });

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
