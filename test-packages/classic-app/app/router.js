import EmberRouter from '@ember/routing/router';
import config from 'classic-app/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('about');
  this.route('redirect');
  this.route('teapot');
  this.route('request');
  this.route('shoebox');
  this.route('deferred');
  this.route('slow');
  this.route('broken');
  this.route('document');
  this.route('lazy');
});
