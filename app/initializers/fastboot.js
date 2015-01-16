/*globals SimpleDOM, Ember, FastBoot*/

function resetTemplateState(container) {
  var cache = container.cache;

  Object.keys(cache).forEach(function(key) {
    if (key.match(/^template:/)) {
      cache[key].cachedFragment = null;
      cache[key].hasRendered = false;
    }
  });
}

export default {
  name: "fast-boot",

  initialize: function(registry) {
    // Detect if we're running in Node. If not, there's nothing to do.
    if (typeof document === 'undefined') {
      var doc = new SimpleDOM.Document();

      // This needs to be setting up renderer:main, and ideally would have a less hacked
      // up interface. In particular, the only ACTUAL swap-in here is the fake document,
      // so it would be nice if we could register just that.
      registry.register('renderer:-dom', {
        create: function() {
          return new Ember.View._Renderer(new Ember.View.DOMHelper(doc));
        }
      });

      Ember.View.reopen({
        appendTo: function() {
          // We should not need to fake out a morph to get the DOM
          var morph = FastBoot.morph = {
            contextualElement: {},
            setContent: function(element) {
              this.element = element;
            },

            destroy: function() { }
          };

          this._morph = morph;

          var app = this.container.lookup('application:main');

          // This should be part of the appInstance.visit API
          Ember.run(this, function() {
            this.renderer.renderTree(this);
          });

          var container = this.container;

          FastBoot.resolve(function(url) {

            // The app should expose a handleURL that returns a promise with the correct info
            return app.__container__.lookup('router:main').handleURL(url).promise.then(function() {
              return new Ember.RSVP.Promise(function(res) {
                // This setTimeout is due to the fact that the router's promise doesn't include
                // a wait for the template to finish rendering. We should add something for this.
                setTimeout(function() {
                  var serializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);
                  res(serializer.serialize(FastBoot.morph.element));

                  // This is to avoid the templates calling cloneNode on the cached fragment on
                  // the second pass through an HTMLBars template.
                  resetTemplateState(container);

                  // This should be replaced by proper support for application instances.
                  app.buildRegistry();
                  app.reset();

                }, 500);
              });
            });
          });
        }
      });
    }
  }
};
