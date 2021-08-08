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
        skipNpm: true,
        emberVersion: 'latest',
        emberDataVersion: '~3.19.0',
      })
      .then(function () {
        app.editPackageJSON((pkg) => {
          delete pkg.devDependencies['ember-fetch'];
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
