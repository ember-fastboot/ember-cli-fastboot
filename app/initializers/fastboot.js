/*globals SimpleDOM, Ember, FastBoot*/

export default {
  name: "fast-boot",

  initialize: function(registry) {
    // Detect if we're running in Node. If not, there's nothing to do.
    if (typeof document === 'undefined') {
      var doc = new SimpleDOM.Document();

      registry.register('renderer:-dom', {
        create: function() {
          return new Ember.View._Renderer(new Ember.View.DOMHelper(doc));
        }
      });

      Ember.View.reopen({
        appendTo: function() {
          var morph = {
            contextualElement: {},
            setContent: function(element) {
              this.element = element;
            }
          };

          this._morph = morph;

          this.renderer.renderTree(this);

          var serializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);
          var serialized = serializer.serialize(morph.element);

          FastBoot.resolve(serialized);
        }
      });
    }
  }
};
