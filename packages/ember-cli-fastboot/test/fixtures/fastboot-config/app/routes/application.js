/* eslint-disable ember/new-module-imports, prettier/prettier */
import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    if (typeof FastBoot !== 'undefined') {
      return window.myGlobal;
    }
  }
});
