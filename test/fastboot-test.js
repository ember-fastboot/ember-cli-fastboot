'use strict';

const expect         = require('chai').expect;
const path           = require('path');
const request        = require('request-promise');
const FastBoot       = require('../index');
const TestHTTPServer = require('./helpers/test-http-server');

describe("FastBoot", function() {
  it("throws an exception if no distPath is provided", function() {
    var fn = function() {
      return new FastBoot();
    };

    expect(fn).to.throw(/You must instantiate FastBoot with a distPath option/);
  });

  it("throws an exception if no package.json exists in the provided distPath", function() {
    var distPath = fixture('no-package-json');
    var fn = function() {
      return new FastBoot({
        distPath: distPath
      });
    };

    expect(fn).to.throw(/Couldn't find (.+)\/fixtures\/no-package-json/);
  });

  it("doesn't throw an exception if a package.json is provided", function() {
    var distPath = fixture('empty-package-json');
    var fn = function() {
      return new FastBoot({
        distPath: distPath
      });
    };

    expect(fn).to.throw(/(.+)\/fixtures\/empty-package-json\/package.json was malformed or did not contain a manifest/);
  });

  it("can render HTML", function() {
    var fastboot = new FastBoot({
      distPath: fixture('basic-app')
    });

    return fastboot.visit('/')
      .then(r => r.html())
      .then(html => {
        expect(html).to.match(/Welcome to Ember/);
      });
  });

  it("rejects the promise if an error occurs", function() {
    var fastboot = new FastBoot({
      distPath: fixture('rejected-promise')
    });

    return expect(fastboot.visit('/')).to.be.rejected;
  });

  it("renders an empty page if the resilient flag is set", function() {
    var fastboot = new FastBoot({
      distPath: fixture('rejected-promise'),
      resilient: true
    });

    return fastboot.visit('/')
      .then(r => r.html())
      .then(html => {
        expect(html).to.match(/<body>/);
      });
  });

  it("can reload the distPath", function() {
    var fastboot = new FastBoot({
      distPath: fixture('basic-app')
    });

    return fastboot.visit('/')
      .then(r => r.html())
      .then(html => expect(html).to.match(/Welcome to Ember/))
      .then(hotReloadApp)
      .then(() => fastboot.visit('/'))
      .then(r => r.html())
      .then(html => expect(html).to.match(/Goodbye from Ember/));

    function hotReloadApp() {
      fastboot.reload({
        distPath: fixture('hot-swap-app')
      });
    }
  });
});

function fixture(fixtureName) {
  return path.join(__dirname, '/fixtures/', fixtureName);
}
