/* eslint-disable ember/new-module-imports, prettier/prettier */
import Ember from 'ember';

let Router = Ember.Router;

Router.map(function() {
  this.route('redirect-on-transition-to');
  this.route('test-passed');
});

export default Router;
