import Ember from 'ember';

export default Ember.Route.extend({
  fastboot: Ember.inject.service(),

  model() {
    let headerToEchoBack = this.get('fastboot.request.headers').get('x-fastboot-echo');
    this.get('fastboot.response.headers').set('x-fastboot-echoed-back', headerToEchoBack);
  }
});
