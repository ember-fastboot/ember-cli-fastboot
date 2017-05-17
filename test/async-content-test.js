'use strict';

const chai = require('chai');
const expect = chai.expect;
const RSVP = require('rsvp');
const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;
const request = require('request');
const get = RSVP.denodeify(request);

describe('async content via deferred content', function() {
  this.timeout(400000);

  describe('with fastboot command', function() {
    let app;

    before(function() {

      app = new AddonTestApp();

      return app.create('async-content')
        .then(function() {
          return app.startServer({
            command: 'fastboot',
            additionalArguments: ['--serve-assets']
          });
        });
    });

    after(function() {
      return app.stopServer();
    });

    it('waits for async content when using `fastboot.deferRendering`', function() {
      return get({
        url: 'http://localhost:49741/'
      })
        .then(function(response) {
          expect(response.body).to.contain('Async content: foo');
        });
    });
  });

  describe('with serve command', function() {
    let app;

    before(function() {

      app = new AddonTestApp();

      return app.create('async-content')
        .then(function() {
          return app.startServer({
            command: 'serve'
          });
        });
    });

    after(function() {
      return app.stopServer();
    });

    it('waits for async content when using `fastboot.deferRendering`', function() {
      return get({
        url: 'http://localhost:49741/',
        headers: {
          'Accept': 'text/html'
        }
      })
        .then(function(response) {
          expect(response.body).to.contain('Async content: foo');
        });
    });
  });
});
