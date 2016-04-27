import Ember from 'ember';

export default Ember.Route.extend({

  afterModel() {
    Ember.run(function() {
      // trigger a run loop error
      let fooEl = Ember.$('foo.bar');
    });
  }
});
