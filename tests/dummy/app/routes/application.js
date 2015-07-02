import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    didTransition: function() {
      var renderer = this.container.lookup('renderer:-dom');
      Ember.set(renderer, '_dom.document.title', 'Application Route -- Title');
      Ember.set(renderer, 'metaTags', [{
        name: 'description',
        content: 'something here'
      }, {
        property: 'og:image',
        content: 'http://placehold.it/500x500'
      }]);
    }
  }
});
