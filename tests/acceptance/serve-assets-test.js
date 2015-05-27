var expect = require('chai').expect;
var RSVP = require('rsvp');
var startServer = require('../helpers/start-server');
var delay = require('../helpers/delay');
var request = RSVP.denodeify(require('request'));

describe('serve assets acceptance', function() {
  var server;

  before(function(done) {
    // start the server once for all tests
    this.timeout(300000);

    function grabChild(child) {
      console.log('saving child');
      server = child;
      done();
    }

    return startServer(grabChild, {
      additionalArguments: ['--serve-assets']
    });
  });

  after(function() {
    server.kill('SIGINT');

    return delay(500);
  });

  it('/assets/vendor.js', function() {
    return request('http://localhost:49741/assets/vendor.js')
      .then(function(response) {
        expect(response.statusCode).to.equal(200);
        expect(response.headers["content-type"]).to.eq("application/javascript");
        expect(response.body).to.contain("Ember =");
      });
  });

  it('/assets/dummy.js', function() {
    return request('http://localhost:49741/assets/dummy.js')
      .then(function(response) {
        expect(response.statusCode).to.equal(200);
        expect(response.headers["content-type"]).to.eq("application/javascript");
        expect(response.body).to.contain("this.route('posts')");
      });
  });
});

