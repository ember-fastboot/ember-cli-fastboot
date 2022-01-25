import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('list-cookies');
  this.route('list-headers');
  this.route('list-query-params');
  this.route('show-body');
  this.route('show-host');
  this.route('show-method');
  this.route('show-path');
  this.route('show-protocol');
});
