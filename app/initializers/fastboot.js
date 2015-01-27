/*globals SimpleDOM, Ember, FastBoot*/

export default {
  name: "fast-boot",

  initialize: function(registry, App) {
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

      FastBoot.resolve(function(url) {
        return App.visit(url).then(function(instance) {
          var view = instance.view;

          view._morph = {
            contextualElement: {},
            setContent: function(element) {
              this.element = element;
            },

            destroy: function() { }
          };

          Ember.run(view, function() {
            view.renderer.renderTree(view);
          });

          var serializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);
          return serializer.serialize(view._morph.element);
        });
      });

      Ember.View.reopen({
        appendTo: function() { }
      });
    }
  }
};
