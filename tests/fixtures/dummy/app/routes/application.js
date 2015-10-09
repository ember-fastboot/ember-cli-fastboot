import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    didTransition: function() {
      var renderer = this.container.lookup('renderer:-dom');
      Ember.set(renderer, '_dom.document.title', 'Application Route -- Title');
    }
  }
});
