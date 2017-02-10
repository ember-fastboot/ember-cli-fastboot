import Ember from 'ember';

export default Ember.Route.extend({
  fastboot: Ember.inject.service(),

  model() {
    return {
      method: this.get('fastboot.request.method')
    };
  }
});
