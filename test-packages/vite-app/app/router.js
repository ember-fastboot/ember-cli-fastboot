import EmberRouter from '@embroider/router';
import config from 'vite-app/config/environment';

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
  this.route('store');
  this.route('lazy');
});
