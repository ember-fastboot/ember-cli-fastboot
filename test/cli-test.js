var expect       = require('chai').expect;
var RSVP         = require('rsvp');
var childProcess = require('child_process');
var path         = require('path');
var exec         = RSVP.denodeify(childProcess.exec);
var request      = require('request-promise');
var Server       = require('./helpers/cli-server');
var temp         = require('temp').track();
var fsp          = require('fs-promise');
var fixturePath  = require('./helpers/fixture-path');

var binPath = path.join(__dirname, '../bin/ember-fastboot');

describe("bin/ember-fastboot", function() {
  it("errors if there is no distPath argument provided", function() {
    return expect(exec(binPath))
      .to.eventually.be.rejectedWith(/You must call ember-fastboot with the path of a fastboot-dist directory/);
  });

  it("starts a server if distPath is provided", function() {
    this.timeout(3000);

    var server = new Server('basic-app');

    return expect(server.start()).to.be.fulfilled
      .then(function() {
        return request('http://localhost:3000');
      })
      .then(function(html) {
        expect(html).to.match(/<h2 id="title">Welcome to Ember<\/h2>/);
      })
      .finally(function() {
        server.stop();
      });
  });

  it("has 1 body tag", function() {
    this.timeout(3000);

    var server = new Server('basic-app');

    return expect(server.start()).to.be.fulfilled
      .then(function() {
        return request('http://localhost:3000');
      })
      .then(function(html) {
        expect(html.match(/<body>/g)).have.length(1);
      })
      .finally(function() {
        server.stop();
      });
  });

  it("serves assets if the --serve-assets-from option is provided", function() {
    this.timeout(3000);

    var assetFixtures = fixturePath('browser-assets');
    var server = new Server('basic-app', {
      args: ['--serve-assets-from', assetFixtures]
    });

    return expect(server.start()).to.be.fulfilled
      .then(function() {
        return request('http://localhost:3000/assets/robots.txt');
      })
      .then(function(text) {
        expect(text).to.match(/www.robotstxt.org/);
      })
      .finally(function() {
        server.stop();
      });
  });

  it("reloads on SIGUSR1", function() {
    this.timeout(7000);

    var tmpPath = temp.path({ suffix: '-fastboot-server-test' });
    var server = new Server({ path: tmpPath });

    after(function() {
      server.stop();
    });

    return expect(fsp.copy(fixturePath('basic-app'), tmpPath)).to.be.fulfilled
      .then(function() {
        return server.start();
      })
      .then(function() {
        return request('http://localhost:3000');
      })
      .then(function(html) {
        expect(html).to.match(/<h2 id="title">Welcome to Ember<\/h2>/);
      })
      .then(function() {
        return fsp.remove(tmpPath);
      })
      .then(function() {
        return fsp.copy(fixturePath('hot-swap-app'), tmpPath);
      })
      .then(function() {
        return server.reload();
      })
      .then(function() {
        return request('http://localhost:3000');
      })
      .then(function(html) {
        expect(html).to.match(/<h2 id="title">Goodbye from Ember<\/h2>/);
      });
  });
});
