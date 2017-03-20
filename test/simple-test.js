var expect           = require('chai').expect;
var RSVP             = require('rsvp');
var request          = RSVP.denodeify(require('request'));

var AddonTestApp     = require('ember-cli-addon-tests').AddonTestApp;

describe('simple acceptance', function() {
  this.timeout(300000);

  var app;

  before(function() {
    app = new AddonTestApp();

    return app.create('dummy')
      .then(function() {
        return app.startServer({
          command: 'fastboot'
        });
      });
  });

  after(function() {
    return app.stopServer();
  });

  it('/ HTML contents', function() {
    return request('http://localhost:49741/')
      .then(function(response) {
        expect(response.statusCode).to.equal(200);
        expect(response.headers["content-type"]).to.eq("text/html; charset=utf-8");
        expect(response.body).to.contain("Welcome to Ember.js");
      });
  });

  it('/posts HTML contents', function() {
    return request('http://localhost:49741/posts')
      .then(function(response) {
        expect(response.statusCode).to.equal(200);
        expect(response.headers["content-type"]).to.eq("text/html; charset=utf-8");
        expect(response.body).to.contain("Welcome to Ember.js");
        expect(response.body).to.contain("Posts Route!");
      });
  });

  it('/not-found HTML contents', function() {
    return request('http://localhost:49741/not-found')
      .then(function(response) {
        expect(response.statusCode).to.equal(404);
        expect(response.headers["content-type"]).to.eq("text/plain; charset=utf-8");
        expect(response.body).to.equal("Not Found");
      });
  });

  it('/boom HTML contents', function() {
    return request('http://localhost:49741/boom')
      .then(function(response) {
        expect(response.statusCode).to.equal(500);
        expect(response.headers["content-type"]).to.eq("text/html; charset=utf-8");
        expect(response.body).to.contain("BOOM");
      });
  });

  it('/assets/vendor.js', function() {
    return request('http://localhost:49741/assets/vendor.js')
      .then(function(response) {
        // Asset serving is off by default
        expect(response.statusCode).to.equal(404);
        expect(response.headers["content-type"]).to.eq("text/plain; charset=utf-8");
        expect(response.body).to.equal("Not Found");
      });
  });
});
