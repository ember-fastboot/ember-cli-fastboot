var expect           = require('chai').expect;
var RSVP             = require('rsvp');
var request          = RSVP.denodeify(require('request'));

var startServer      = require('../helpers/start-server');
var acceptance       = require('../helpers/acceptance');
var createApp        = acceptance.createApp;
var copyFixtureFiles = acceptance.copyFixtureFiles;

var appName          = 'dummy';

describe('serve assets acceptance', function() {
  this.timeout(300000);
  var server;

  before(function(done) {
    // start the server once for all tests
    this.timeout(300000);

    function grabChild(child) {
      server = child;
      done();
    }

    return createApp(appName)
      .then(function() {
        return copyFixtureFiles(appName);
      })
      .then(function() {
        return startServer(grabChild, {
          additionalArguments: ['--serve-assets']
        });
      })
      .catch(function(e) {
        console.log(e);
      });
  });

  after(function() {
    server.kill('SIGINT');
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
