var chai = require('chai');
var expect = chai.expect;
var RSVP = require('rsvp');
var AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;
var request = require('request');
var get = RSVP.denodeify(request);

describe('response details', function() {
  this.timeout(300000);

  describe('with fastboot command', function() {
    var app;

    before(function() {

      app = new AddonTestApp();

      return app.create('response')
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

    it('makes headers available via a service', function() {
      return get({
        url: 'http://localhost:49741/echo-request-headers',
        headers: { 'X-FastBoot-echo': 'i-should-be-echoed-back' }
      })
        .then(function(response) {
          expect(response.headers).to.include.keys('x-fastboot-echoed-back');
          expect(response.headers['x-fastboot-echoed-back']).to.include('i-should-be-echoed-back');
        });
    });

    it('makes the status code available via a service', function() {
      return get({
        url: 'http://localhost:49741/return-status-code-418'
      })
        .then(function(response) {
          expect(response.statusCode).to.equal(418);
        });
    });
  });

  describe('with serve command', function() {
    var app;

    before(function() {

      app = new AddonTestApp();

      return app.create('response')
        .then(function() {
          return app.startServer({
            command: 'serve'
          });
        });
    });

    after(function() {
      return app.stopServer();
    });

    it('makes headers available via a service', function() {
      return get({
        url: 'http://localhost:49741/echo-request-headers',
        headers: {
          'X-FastBoot-echo': 'i-should-be-echoed-back',
          'Accept': 'text/html'
        }
      })
        .then(function(response) {
          expect(response.headers).to.include.keys('x-fastboot-echoed-back');
          expect(response.headers['x-fastboot-echoed-back']).to.include('i-should-be-echoed-back');
        });
    });

    it('makes the status code available via a service', function() {
      return get({
        url: 'http://localhost:49741/return-status-code-418',
        headers: {
          'Accept': 'text/html'
        }
      })
        .then(function(response) {
          expect(response.statusCode).to.equal(418);
        });
    });
  });
});
