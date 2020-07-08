import Ember from 'ember';

export default Ember.Route.extend({
  fastboot: Ember.inject.service(),

  model() {
    return {
      protocol: this.get('fastboot.request.protocol')
    };
  }
});
