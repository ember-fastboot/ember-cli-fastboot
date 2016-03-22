import Ember from 'ember';

export default Ember.Route.extend({
  fastboot: Ember.inject.service(),

  model() {
    return {
      host: this.get('fastboot.host')
    };
  }
});
