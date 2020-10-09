import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  this.route('posts');
  this.route('boom');
  this.route('imports');
  this.route('error-route');
  this.route('async-content');
  this.route('echo-request-headers');
  this.route('return-status-code-418');
});
