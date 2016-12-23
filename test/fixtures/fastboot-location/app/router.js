import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('redirect-on-intermediate-transition-to');
  this.route('redirect-on-transition-to');
  this.route('redirect-on-replace-with');
  this.route('test-passed');
});

export default Router;
