var expect         = require('chai').expect;
var fs             = require('fs');
var path           = require('path');
var request        = require('request-promise');
var FastBootServer = require('../lib/server.js');
var TestHTTPServer = require('./helpers/test-http-server');

function cleanup(server) {
  return function() {
    server.stop();
  }
}

function requestIndex(assertion) {
  return function(info) {
    var url = 'http://[' + info.host + ']:' + info.port + '/';

    return request(url)
    .then(assertion)
    .then(function() {
      return info;
    });
  }
}

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

  it('reads the config from package.json', function() {
    var distPath = fixture('config-app');

    var server = new TestHTTPServer({
      distPath: distPath,
      port: 0
    });

    var promise = server.start()
      .then(requestIndex(function (html) {
        expect(html).to.match(/Config foo: bar/);
      }))
      .finally(cleanup(server));

    return promise;
  });

  it('handles apps with config defined in app.js', function() {
    var distPath = fixture('config-not-in-meta-app');

    var server = new TestHTTPServer({
      distPath: distPath,
      port: 0
    });

    var promise = server.start()
      .then(requestIndex(function(html) {
        expect(html).to.match(/Welcome to Ember/);
      }))
      .finally(cleanup(server));

    return promise;
  });

  it('prefers APP_CONFIG environment variable', function() {
    var distPath = fixture('config-app');

    var config = {
      modulePrefix: "fastboot-test",
      environment: "development",
      baseURL: "/",
      locationType: "auto",
      EmberENV: { "FEATURES":{} },
      APP: {
        name: "fastboot-test",
        version: "0.0.0+3e9fe92d",
        autoboot: false,
        foo: "baz"
      },
      exportApplicationGlobal:true
    };

    process.env.APP_CONFIG = JSON.stringify(config);

    var server = new TestHTTPServer({
      distPath: distPath,
      port: 0
    });

    var promise = server.start()
      .then(requestIndex(function(html) {
        expect(html).to.match(/Config foo: baz/);
      }))
      .finally(cleanup(server));

    delete process.env.APP_CONFIG;

    return promise;
  });

  it("can reload the distPath", function() {
    var distPath = fixture('basic-app');

    var server = new TestHTTPServer({
      distPath: distPath,
      port: 0
    });

    var promise = server.start()
      .then(requestIndex(function(html) {
        expect(html).to.match(/Welcome to Ember/);
      }))
      .then(hotReloadApp)
      .then(requestIndex(function(html) {
        expect(html).to.match(/Goodbye from Ember/);
      }))
      .finally(cleanup(server));

    return promise;

    function hotReloadApp(info) {
      return server.withFastBootServer(function(fbs) {
        fbs.reload({
          distPath: fixture('hot-swap-app')
        });

        return info;
      })
    }
  });

  it("reloads the config when package.json changes", function() {
    var distPath = fixture('config-swap-app');
    var packagePath = path.join(distPath, 'package.json');
    var package1Path = path.join(distPath, 'package-1.json');
    var package2Path = path.join(distPath, 'package-2.json');

    copyPackage(package1Path);
    var server = new TestHTTPServer({
      distPath: distPath,
      port: 0
    });

    var promise = server.start()
      .then(requestIndex(function(html) {
        expect(html).to.match(/Config foo: bar/);
      }))
      .then(hotReloadApp)
      .then(requestIndex(function(html) {
        expect(html).to.match(/Config foo: boo/);
      }))
      .finally(cleanupAndDeleteFile);

    return promise;

    function copyPackage(sourcePackage) {
      fs.symlinkSync(sourcePackage, packagePath);
    }

    function deletePackage() {
      fs.unlinkSync(packagePath);
    }

    function hotReloadApp(info) {
      deletePackage();
      copyPackage(package2Path);

      return server.withFastBootServer(function(fbs) {
        fbs.reload({
          distPath: distPath
        });

        return info;
      });
    }

    function cleanupAndDeleteFile() {
      cleanup(server)();
      deletePackage();
    }
  });
});

function fixture(fixtureName) {
  return path.join(__dirname, '/fixtures/', fixtureName);
}
