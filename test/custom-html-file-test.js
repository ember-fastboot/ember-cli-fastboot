var expect           = require('chai').expect;
var RSVP             = require('rsvp');
var request          = RSVP.denodeify(require('request'));

var AddonTestApp     = require('ember-cli-addon-tests').AddonTestApp;

describe('custom htmlFile', function() {
  this.timeout(300000);

  var app;

  before(function() {
    app = new AddonTestApp();

    return app.create('custom-html-file')
      .then(function() {
        return app.startServer({
          command: 'fastboot'
        });
      });
  });

  after(function() {
    return app.stopServer();
  });

  it('uses custom htmlFile', function() {
    return request('http://localhost:49741/')
      .then(function(response) {
        expect(response.statusCode).to.equal(200);
        expect(response.headers["content-type"]).to.eq("text/html; charset=utf-8");

        expect(response.body).to.contain("<title>custom index</title>");
        expect(response.body).to.contain("<h1>application template</h1>");
      });
  });
});
