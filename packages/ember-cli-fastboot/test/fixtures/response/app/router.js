import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('echo-request-headers');
  this.route('return-status-code-418');
});

export default Router;
