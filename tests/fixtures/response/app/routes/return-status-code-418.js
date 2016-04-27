import Ember from 'ember';

export default Ember.Route.extend({
  fastboot: Ember.inject.service(),

  model() {
    this.set('fastboot.response.statusCode', 418);
  }
});
