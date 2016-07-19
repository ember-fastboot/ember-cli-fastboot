var chai = require('chai');
var expect = chai.expect;
var RSVP = require('rsvp');
var AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;
var request = require('request');
var get = RSVP.denodeify(request);

describe('request details', function() {
  this.timeout(300000);

  var app;

  before(function() {

    app = new AddonTestApp();

    return app.create('request')
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

  it('makes host available via a service', function() {
    return get({
      url: 'http://::1:49741/show-host'
    })
      .then(function(response) {
        expect(response.body).to.contain('Host: ::1:49741');
        expect(response.body).to.contain('Host from Instance Initializer: ::1:49741');
      });
  });

  it('makes protocol available via a service', function() {
    return get({
      url: 'http://::1:49741/show-protocol'
    })
      .then(function(response) {
        expect(response.body).to.contain('Protocol: http');
        expect(response.body).to.contain('Protocol from Instance Initializer: http');
      });
  });

  it('makes path available via a service', function() {
    return get({
      url: 'http://::1:49741/show-path'
    })
      .then(function(response) {
        expect(response.body).to.contain('Path: /show-path');
        expect(response.body).to.contain('Path from Instance Initializer: /show-path');
      });
  });

  it('makes query params available via a service', function() {
    return get({
      url: 'http://::1:49741/list-query-params?foo=bar'
    })
      .then(function(response) {
        expect(response.body).to.contain('Query Params: bar');
        expect(response.body).to.contain('Query Params from Instance Initializer: bar');
      });
  });

  it('makes cookies available via a service', function() {
    var jar = request.jar();
    var cookie = request.cookie('city=Cluj');

    jar.setCookie(cookie, 'http://::1:49741');

    return get({
      url: 'http://::1:49741/list-cookies',
      jar: jar
    })
      .then(function(response) {
        expect(response.body).to.contain('Cookies: Cluj');
        expect(response.body).to.contain('Cookies from Instance Initializer: Cluj');
      });
  });

  it('makes headers available via a service', function() {
    return get({
      url: 'http://::1:49741/list-headers',
      headers: { 'X-FastBoot-info': 'foobar' }
    })
      .then(function(response) {
        expect(response.body).to.contain('Headers: foobar');
        expect(response.body).to.contain('Headers from Instance Initializer: foobar');
      });
  });
});
