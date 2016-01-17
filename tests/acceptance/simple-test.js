var expect           = require('chai').expect;
var RSVP             = require('rsvp');
var startServer      = require('../helpers/start-server');
var request          = RSVP.denodeify(require('request'));

var acceptance       = require('../helpers/acceptance');
var createApp        = acceptance.createApp;
var copyFixtureFiles = acceptance.copyFixtureFiles;

var appName          = 'dummy';

describe('simple acceptance', function() {
  this.timeout(300000);
  var server;

  before(function(done) {
    // start the server once for all tests

    var grabChild = function(child) {
      server = child;
      done();
    };

    return createApp(appName)
      .then(function() {
        return copyFixtureFiles(appName);
      })
      .then(function() {
        return startServer(grabChild);
      })
      .catch(function(e) {
        console.log(e.stack);
      });
  });

  after(function() {
    server.kill('SIGINT');
  });

  it('/ HTML contents', function() {
    return request('http://localhost:49741/')
      .then(function(response) {
        expect(response.statusCode).to.equal(200);
        expect(response.headers["content-type"]).to.eq("text/html; charset=utf-8");
        expect(response.body).to.contain('<title>Application Route -- Title</title>');
        expect(response.body).to.contain("Welcome to Ember.js");
      });
  });

  it('/posts HTML contents', function() {
    return request('http://localhost:49741/posts')
      .then(function(response) {
        expect(response.statusCode).to.equal(200);
        expect(response.headers["content-type"]).to.eq("text/html; charset=utf-8");
        expect(response.body).to.contain('<title>Application Route -- Title</title>');
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
        expect(response.headers["content-type"]).to.eq("text/plain; charset=utf-8");
        expect(response.body).to.equal("Internal Server Error");
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
