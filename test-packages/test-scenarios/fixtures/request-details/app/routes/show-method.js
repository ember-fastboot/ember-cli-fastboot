/* eslint-disable ember/new-module-imports, ember/no-get, prettier/prettier */
import Ember from 'ember';

export default Ember.Route.extend({
  fastboot: Ember.inject.service(),

  model() {
    return {
      method: this.get('fastboot.request.method')
    };
  }
});
