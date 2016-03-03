var expect = require('chai').expect;
var path = require('path');
var FastBootServer = require('../lib/server.js');

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
});

function fixture(fixtureName) {
  return path.join(__dirname, '/fixtures/', fixtureName);
}
