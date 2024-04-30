/* eslint-disable ember/new-module-imports, prettier/prettier */
import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel() {
    this.replaceWith('noop-replace-with');
  }
});
