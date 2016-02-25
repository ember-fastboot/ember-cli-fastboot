var chai = require('chai');
var expect = chai.expect;
var RSVP = require('rsvp');
var AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;
var request = require('request');
var get = RSVP.denodeify(request);

describe('headers', function() {
  this.timeout(300000);

  var app;

  before(function() {

    app = new AddonTestApp();

    return app.create('headers')
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
      url: 'http://localhost:49741/list-headers',
      headers: { 'X-FastBoot-info': 'foobar' }
    })
      .then(function(response) {
        expect(response.body).to.contain('Headers: foobar');
        expect(response.body).to.contain('Headers from Instance Initializer: foobar');
      });
  });
});
