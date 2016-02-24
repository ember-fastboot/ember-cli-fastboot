var chai = require('chai');
var expect = chai.expect;
var RSVP = require('rsvp');
var AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;
var request = require('request');
var get = RSVP.denodeify(request);

describe('cookies', function() {
  this.timeout(300000);

  var app;

  before(function() {

    app = new AddonTestApp();

    return app.create('cookies')
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

  it('makes cookies available via a service', function() {
    var jar = request.jar();
    var cookie = request.cookie('city=Cluj');

    jar.setCookie(cookie, 'http://localhost:49741');

    return get({
      url: 'http://localhost:49741/list-cookies',
      jar: jar
    })
      .then(function(response) {
        expect(response.body).to.contain('Cookies: Cluj');
        expect(response.body).to.contain('Cookies from Instance Initializer: Cluj');
      });
  });
});
