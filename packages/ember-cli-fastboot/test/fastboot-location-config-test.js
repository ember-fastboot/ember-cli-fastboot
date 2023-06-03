/* eslint-disable no-undef */
'use strict';

const expect = require('chai').expect;
const RSVP = require('rsvp');
const request = RSVP.denodeify(require('request'));

const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

describe('FastBootLocation Configuration', function () {
  this.timeout(300000);

  let app;

  before(function () {
    app = new AddonTestApp();

    return app
      .create('fastboot-location-config', {
        emberVersion: 'latest',
        emberDataVersion: 'latest',
      })
      .then(function () {
        app.editPackageJSON((pkg) => {
          delete pkg.devDependencies['ember-fetch'];
          delete pkg.devDependencies['ember-welcome-page'];
          // needed because @ember-data/store does `FastBoot.require('crypto')`
          pkg.fastbootDependencies = ['crypto'];
        });
        return app.run('npm', 'install');
      })
      .then(function () {
        return app.startServer({
          command: 'serve',
        });
      });
  });

  after(function () {
    return app.stopServer();
  });

  it('should use the redirect code provided by the EmberApp', function () {
    return request({
      url: 'http://localhost:49741/redirect-on-transition-to',
      followRedirect: false,
      headers: {
        Accept: 'text/html',
      },
    }).then(function (response) {
      if (response.statusCode === 500) throw new Error(response.body);
      expect(response.statusCode).to.equal(302);
      expect(response.headers.location).to.equal(
        '//localhost:49741/test-passed'
      );
    });
  });

  describe('when fastboot.fastbootHeaders is false', function () {
    it('should not send the "x-fastboot-path" header on a redirect', function () {
      return request({
        url: 'http://localhost:49741/redirect-on-transition-to',
        followRedirect: false,
        headers: {
          Accept: 'text/html',
        },
      }).then(function (response) {
        if (response.statusCode === 500) throw new Error(response.body);
        expect(response.headers).to.not.include.keys(['x-fastboot-path']);
      });
    });
  });
});
