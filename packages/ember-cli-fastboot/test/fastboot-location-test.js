'use strict';

const expect = require('chai').expect;
const RSVP = require('rsvp');
const request = RSVP.denodeify(require('request'));

const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

describe('FastBootLocation', function () {
  this.timeout(300000);

  let app;
  before(function () {
    app = new AddonTestApp();

    return app
      .create('fastboot-location', {
        skipNpm: true,
        emberVersion: 'latest',
        emberDataVersion: 'latest',
      })
      .then(function () {
        app.editPackageJSON((pkg) => {
          delete pkg.devDependencies['ember-fetch'];
          delete pkg.devDependencies['ember-welcome-page'];
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

  it('should NOT redirect when no transition is called', function () {
    return request({
      url: 'http://localhost:49741/my-root/test-passed',
      followRedirect: false,
      headers: {
        Accept: 'text/html',
      },
    }).then(function (response) {
      if (response.statusCode === 500) throw new Error(response.body);
      expect(response.statusCode).to.equal(200);

      expect(response.headers).to.not.include.keys('location');
      expect(response.headers).to.include.keys('x-fastboot-path');
      expect(response.headers['x-fastboot-path']).to.equal(
        '/my-root/test-passed'
      );

      expect(response.body).to.contain('The Test Passed!');
    });
  });

  it('should NOT redirect when intermediateTransitionTo is called', function () {
    return request({
      url: 'http://localhost:49741/my-root/redirect-on-intermediate-transition-to',
      followRedirect: false,
      headers: {
        Accept: 'text/html',
      },
    }).then(function (response) {
      if (response.statusCode === 500) throw new Error(response.body);
      expect(response.statusCode).to.equal(200);

      expect(response.headers).to.not.include.keys('location');
      expect(response.headers).to.include.keys('x-fastboot-path');
      expect(response.headers['x-fastboot-path']).to.equal(
        '/my-root/redirect-on-intermediate-transition-to'
      );

      expect(response.body).to.not.contain('Welcome to Ember');
      expect(response.body).to.not.contain('The Test Passed!');
    });
  });

  it('should redirect when transitionTo is called', function () {
    return request({
      url: 'http://localhost:49741/my-root/redirect-on-transition-to',
      followRedirect: false,
      headers: {
        Accept: 'text/html',
      },
    }).then(function (response) {
      if (response.statusCode === 500) throw new Error(response.body);
      expect(response.statusCode).to.equal(307);

      expect(response.headers).to.include.keys(['location', 'x-fastboot-path']);
      expect(response.headers.location).to.equal(
        '//localhost:49741/my-root/test-passed'
      );
      expect(response.headers['x-fastboot-path']).to.equal(
        '/my-root/test-passed'
      );
      expect(response.body).to.contain('Redirecting to');
      expect(response.body).to.contain('/my-root/test-passed');
    });
  });

  it('should redirect when replaceWith is called', function () {
    return request({
      url: 'http://localhost:49741/my-root/redirect-on-replace-with',
      followRedirect: false,
      headers: {
        Accept: 'text/html',
      },
    }).then(function (response) {
      if (response.statusCode === 500) throw new Error(response.body);
      expect(response.statusCode).to.equal(307);

      expect(response.headers).to.include.keys(['location', 'x-fastboot-path']);
      expect(response.headers.location).to.equal(
        '//localhost:49741/my-root/test-passed'
      );
      expect(response.headers['x-fastboot-path']).to.equal(
        '/my-root/test-passed'
      );
      expect(response.body).to.contain('Redirecting to');
      expect(response.body).to.contain('/my-root/test-passed');
    });
  });

  it('should NOT redirect when transitionTo is called with identical route name', function () {
    return request({
      url: 'http://localhost:49741/my-root/noop-transition-to',
      followRedirect: false,
      headers: {
        Accept: 'text/html',
      },
    }).then(function (response) {
      if (response.statusCode === 500) throw new Error(response.body);
      expect(response.statusCode).to.equal(200);

      expect(response.headers).to.not.include.keys('location');
      expect(response.headers).to.include.keys('x-fastboot-path');
      expect(response.headers['x-fastboot-path']).to.equal(
        '/my-root/noop-transition-to'
      );

      expect(response.body).to.contain('Redirect to self');
    });
  });

  it('should NOT redirect when replaceWith is called with identical route name', function () {
    return request({
      url: 'http://localhost:49741/my-root/noop-replace-with',
      followRedirect: false,
      headers: {
        Accept: 'text/html',
      },
    }).then(function (response) {
      if (response.statusCode === 500) throw new Error(response.body);
      expect(response.statusCode).to.equal(200);

      expect(response.headers).to.not.include.keys('location');
      expect(response.headers).to.include.keys('x-fastboot-path');
      expect(response.headers['x-fastboot-path']).to.equal(
        '/my-root/noop-replace-with'
      );

      expect(response.body).to.contain('Redirect to self');
    });
  });
});
