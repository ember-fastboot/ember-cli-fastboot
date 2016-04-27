var expect           = require('chai').expect;
var RSVP             = require('rsvp');
var request          = RSVP.denodeify(require('request'));

var AddonTestApp     = require('ember-cli-addon-tests').AddonTestApp;

describe('error handler acceptance', function() {
  this.timeout(300000);

  var app;

  before(function() {
    app = new AddonTestApp();

    return app.create('error-handler')
      .then(function() {
        return app.startServer({
          command: 'fastboot'
        });
      });
  });

  after(function() {
    return app.stopServer();
  });

  it('visiting `/` does not result in an error', function() {
    return request('http://localhost:49741/')
      .then(function(response) {
        expect(response.statusCode).to.equal(200);
      });
  });
});
