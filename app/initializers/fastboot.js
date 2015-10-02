/*globals SimpleDOM, Ember, FastBoot, URL*/

export default {
  name: "fast-boot",

  initialize: function(App) {
    // Detect if we're running in Node. If not, there's nothing to do.
    if (typeof document === 'undefined') {
      var doc = new SimpleDOM.Document();
      var domHelper = new Ember.HTMLBars.DOMHelper(doc);

      domHelper.protocolForURL = function(url) {
        var protocol = URL.parse(url).protocol;
        return (protocol == null) ? ':' : protocol;
      };

      domHelper.setMorphHTML = function(morph, html) {
        var section = this.document.createRawHTMLSection(html);
        morph.setNode(section);
      };

      // Disable autobooting of the app. This will disable automatic routing,
      // and routing will only occur via our calls to visit().
      App.autoboot = false;

      // This needs to be setting up renderer:main, and ideally would have a less hacked
      // up interface. In particular, the only ACTUAL swap-in here is the fake document,
      // so it would be nice if we could register just that.
      App.register('renderer:-dom', {
        create: function() {
          var Renderer = Ember._Renderer || Ember.View._Renderer;
          return new Renderer(domHelper, false);
        }
      });

      FastBoot.debug("resolving FastBoot promise");

      FastBoot.resolve(function(url) {
        FastBoot.debug("routing; url=%s", url);

        var promise;
        Ember.run(function() {
          promise = App.visit(url);
        });

        return promise.then(function(instance) {
          var serializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);
          var view = instance.view;
          var dom = view.renderer._dom;
          var head = dom.document.head;
          var body;

          Ember.run(function() {
            body = view.renderToElement();
          });

          return {
            body: serializer.serializeChildren(body),
            head: (head === null) ? null : serializer.serializeChildren(head)
          };
        });
      });
    }
  }
};
