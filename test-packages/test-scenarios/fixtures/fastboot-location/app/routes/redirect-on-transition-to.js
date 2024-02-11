/* eslint-disable ember/new-module-imports, prettier/prettier */
import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel() {
    this.transitionTo('test-passed');
  }
});
