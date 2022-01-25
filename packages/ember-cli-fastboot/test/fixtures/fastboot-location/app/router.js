import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('noop-transition-to');
  this.route('noop-replace-with');
  this.route('redirect-on-intermediate-transition-to');
  this.route('redirect-on-transition-to');
  this.route('redirect-on-replace-with');
  this.route('test-passed');
});
