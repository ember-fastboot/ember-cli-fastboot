var chai = require('chai');
var expect = chai.expect;
var RSVP = require('rsvp');
var AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;
var request = require('request');
var get = RSVP.denodeify(request);

describe('async content via deferred content', function() {
  this.timeout(400000);

  describe('with fastboot command', function() {
    var app;

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
    var app;

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
