import Ember from 'ember';

export default Ember.Route.extend({
  headData: Ember.inject.service(),

  afterModel() {
    this.set('headData.title', 'Head Data Title');
  }
});
