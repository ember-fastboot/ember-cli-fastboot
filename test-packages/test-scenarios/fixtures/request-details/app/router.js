/* eslint-disable ember/new-module-imports, prettier/prettier */
import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('list-cookies');
  this.route('list-headers');
  this.route('list-query-params');
  this.route('show-body');
  this.route('show-host');
  this.route('show-method');
  this.route('show-path');
  this.route('show-protocol');
});

export default Router;
