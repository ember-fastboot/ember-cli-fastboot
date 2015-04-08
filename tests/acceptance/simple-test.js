var expect = require('chai').expect;
var RSVP = require('rsvp');
var Promise = RSVP.Promise;
var startServer = require('../helpers/start-server');
var request = RSVP.denodeify(require('request'));

describe('simple acceptance', function() {
  var server;

  before(function(done) {
    // start the server once for all tests
    this.timeout(300000);

    function grabChild(child) {
      console.log('saving child');
      server = child;
      done();
    }

    return startServer(grabChild);
  });

  after(function() {
    server.kill('SIGINT');
  });

  it('/ HTML contents', function() {
    return request('http://localhost:49741/')
      .then(function(response) {
        expect(response.body).to.contain("Welcome to Ember.js");
      });
  });

  it('/posts HTML contents', function() {
    return request('http://localhost:49741/posts')
      .then(function(response) {
        expect(response.body).to.contain("Welcome to Ember.js");
        expect(response.body).to.contain("Posts Route!");
      });
  });
});
