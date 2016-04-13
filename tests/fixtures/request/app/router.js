import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('show-host');
  this.route('show-protocol');
  this.route('show-path');
  this.route('list-cookies');
  this.route('list-headers');
  this.route('list-query-params');
  this.route('list-headers');
});

export default Router;
