import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    didTransition: function() {
      var renderer = this.container.lookup('renderer:-dom');
      Ember.set(renderer, '_dom.document.title', 'Application Route -- Title');
      Ember.set(renderer, 'metaTags', [{
          name: 'meta',
          attrs: {
            name: 'description',
            content: 'something here'
          }
        },
        {
          name: 'meta',
          attrs: {
            property: 'og:image',
            content: 'http://placehold.it/500x500'
          }
        }
      ]);
    }
  }
});
