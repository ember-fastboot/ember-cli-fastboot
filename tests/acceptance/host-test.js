var chai = require('chai');
var expect = chai.expect;
var RSVP = require('rsvp');
var AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;
var request = require('request');
var get = RSVP.denodeify(request);

describe('host', function() {
  this.timeout(300000);

  var app;

  before(function() {

    app = new AddonTestApp();

    return app.create('host')
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
      url: 'http://localhost:49741/show-host'
    })
      .then(function(response) {
        expect(response.body).to.contain('Host: http://localhost:49741');
        expect(response.body).to.contain('Host from Instance Initializer: http://localhost:49741');
      });
  });
});
