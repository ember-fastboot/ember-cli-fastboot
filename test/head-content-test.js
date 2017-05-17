'use strict';

const expect = require('chai').expect;
const RSVP = require('rsvp');
const request = RSVP.denodeify(require('request'));

const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

// TODO: Unskip this test once ember-cli-head is released with new fastboot build spec.
describe.skip('head content acceptance', function() {
  this.timeout(300000);

  describe('with fastboot command', function() {
    let app;

    before(function() {
      app = new AddonTestApp();

      return app.create('head-content')
        .then(addDependencies)
        .then(function() {
          return app.startServer({
            command: 'fastboot'
          });
        });
    });

    after(function() {
      return app.stopServer();
    });

    it('/ Has head content replaced', function() {
      return request('http://localhost:49741/')
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
          expect(response.headers["content-type"]).to.eq("text/html; charset=utf-8");
          expect(response.body).to.contain('<meta property="og:title" content="Head Data Title">');
          expect(response.body).to.not.contain('<!-- EMBER_CLI_FASTBOOT_HEAD -->');
        });
    });
  });

  describe('with serve command', function() {
    let app;

    before(function() {
      app = new AddonTestApp();

      return app.create('head-content')
        .then(addDependencies)
        .then(function() {
          return app.startServer({
            command: 'serve'
          });
        });
    });

    after(function() {
      return app.stopServer();
    });

    it('/ Has head content replaced', function() {
      return request({
        url: 'http://localhost:49741/',
        headers: {
          'Accept': 'text/html'
        }})
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
          expect(response.headers["content-type"]).to.eq("text/html; charset=utf-8");
          expect(response.body).to.contain('<meta property="og:title" content="Head Data Title">');
          expect(response.body).to.not.contain('<!-- EMBER_CLI_FASTBOOT_HEAD -->');
        });
    });
  });
});

function addDependencies(app) {
  app.editPackageJSON(function(pkg) {
    pkg['devDependencies']['ember-cli-head'] = "*";
  });
  return app.run('npm', 'install');
}
