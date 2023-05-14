/* eslint-disable no-undef */
'use strict';

const expect = require('chai').use(require('chai-string')).expect;
const RSVP = require('rsvp');
const request = RSVP.denodeify(require('request'));

const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

describe('FastBoot config', function () {
  this.timeout(400000);

  let app;

  before(function () {
    app = new AddonTestApp();

    return app
      .create('fastboot-config', {
        emberVersion: '~3.28.12',
        emberDataVersion: '~3.28.12',
      })
      .then(function () {
        app.editPackageJSON((pkg) => {
          delete pkg.devDependencies['ember-fetch'];
          delete pkg.devDependencies['ember-welcome-page'];
          // needed because @ember-data/store does `FastBoot.require('crypto')`
          pkg.fastbootDependencies = ['node-fetch', 'path', 'crypto'];
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

  it('provides sandbox globals', function () {
    return request({
      url: 'http://localhost:49741/',
      headers: {
        Accept: 'text/html',
      },
    }).then(function (response) {
      expect(response.statusCode).to.equal(200);
      expect(response.headers['content-type']).to.equalIgnoreCase(
        'text/html; charset=utf-8'
      );
      expect(response.body).to.contain('<h1>My Global</h1>');
    });
  });
});
