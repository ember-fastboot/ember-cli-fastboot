import Ember from 'ember';

let Router = Ember.Router;

Router.map(function() {
  this.route('redirect-on-intermediate-transition-to');
  this.route('redirect-on-transition-to');
  this.route('redirect-on-replace-with');
  this.route('test-passed');
});

export default Router;
