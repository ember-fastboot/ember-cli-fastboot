var expect         = require('chai').expect;
var path           = require('path');
var request        = require('request-promise');
var FastBootServer = require('../lib/server.js');
var TestHTTPServer = require('./helpers/test-http-server');

describe("FastBootServer", function() {
  it("throws an exception if no distPath is provided", function() {
    var fn = function() {
      return new FastBootServer();
    };

    expect(fn).to.throw(/You must instantiate FastBootServer with a distPath option/);
  });

  it("throws an exception if no package.json exists in the provided distPath", function() {
    var distPath = fixture('no-package-json');
    var fn = function() {
      return new FastBootServer({
        distPath: distPath
      });
    };

    expect(fn).to.throw(/Couldn't find (.+)\/fixtures\/no-package-json/);
  });

  it("doesn't throw an exception if a package.json is provided", function() {
    var distPath = fixture('empty-package-json');
    var fn = function() {
      return new FastBootServer({
        distPath: distPath
      });
    };

    expect(fn).to.throw(/(.+)\/fixtures\/empty-package-json\/package.json was malformed or did not contain a manifest/);
  });

  it("can reload the distPath", function() {
    var distPath = fixture('basic-app');

    var server = new TestHTTPServer({
      distPath: distPath
    });

    var promise = server.start()
      .then(requestFirstApp)
      .then(hotReloadApp)
      .then(requestSecondApp);

    promise.finally(cleanup);

    var url;

    return promise;


    function requestFirstApp(info) {
      url = 'http://[' + info.host + ']:' + info.port + '/';

      return request(url)
        .then(function(html) {
          expect(html).to.match(/Welcome to Ember/);
        });
    }

    function hotReloadApp() {
      return server.withFastBootServer(function(fbs) {
        return fbs.reload({
          distPath: fixture('hot-swap-app')
        });
      });
    }

    function requestSecondApp(info) {
      return request(url)
        .then(function(html) {
          expect(html).to.match(/Goodbye from Ember/);
        });
    }

    // Always clean up the server
    function cleanup() {
      if (info && info.listener) {
        info.listener.close();
      }
    }
  });
});

function fixture(fixtureName) {
  return path.join(__dirname, '/fixtures/', fixtureName);
}
