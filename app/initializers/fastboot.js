/*globals SimpleDOM, Ember, FastBoot, URL*/

export default {
  name: "fast-boot",

  initialize: function(registry, App) {
    // Detect if we're running in Node. If not, there's nothing to do.
    if (typeof document === 'undefined') {
      var doc = new SimpleDOM.Document();
      var domHelper = new Ember.HTMLBars.DOMHelper(doc);

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
          var Renderer = Ember._Renderer || Ember.View._Renderer;
          return new Renderer(domHelper, false);
        }
      });

      FastBoot.debug("resolving FastBoot promise");

      FastBoot.resolve(function(url) {
        FastBoot.debug("routing; url=%s", url);

        return App.visit(url).then(function(instance) {
          var serializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);
          var view = instance.view;
          var dom = view.renderer._dom;
          var title = dom.document.title;
          var head = dom.document.head;
          var metaTags = view.renderer.metaTags;
          var body;
          var element;

          Ember.run(function() {
            body = view.renderToElement();
          });

          if (title) {
            element = dom.document.createElement('title');
            element.appendChild(dom.document.createTextNode(title));
            head.appendChild(element);
          }

          if (metaTags) {
            metaTags.forEach(function(metaTag) {
              element = dom.document.createElement(metaTag.name);

              Object.keys(metaTag.attrs).forEach(function(key) {
                element.setAttribute(key, metaTag.attrs[key]);
              });

              for (var i = 2; i < arguments.length; i++) {
                element.appendChild(arguments[i]);
              }

              head.appendChild(element);
            });
          }

          body = body.firstChild;
          head = head.firstChild;

          return {
            body: serializer.serialize(body),
            head: (head === null) ? null : serializer.serialize(head)
          };
        });
      });
    }
  }
};
