/* eslint-disable no-undef */
'use strict';

const chai = require('chai');
const expect = chai.expect;
const RSVP = require('rsvp');
const path = require('path');
const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;
const request = RSVP.denodeify(require('request'));

async function injectMiddlewareAddon(app) {
  app.editPackageJSON(function (pkg) {
    pkg.devDependencies['body-parser'] =
      process.env.npm_package_devDependencies_body_parser;
    pkg.dependencies = pkg.dependencies || {};
    pkg.dependencies['fastboot-express-middleware'] =
      process.env.npm_package_dependencies_fastboot_express_middleware;
    pkg['ember-addon'] = {
      paths: ['lib/post-middleware'],
    };
    delete pkg.devDependencies['ember-fetch'];
    delete pkg.devDependencies['ember-welcome-page'];
    // needed because @ember-data/store does `FastBoot.require('crypto')`
    pkg.fastbootDependencies = ['node-fetch', 'path', 'crypto'];
  });
  await app.run('npm', 'install', '--no-package-lock');
  await app.run(
    'ln',
    '-s',
    path.resolve(__dirname, '../../fastboot'),
    path.resolve(app.path, 'node_modules/fastboot')
  );
  await app.run(
    'ln',
    '-s',
    path.resolve(__dirname, '../../fastboot-express-middleware'),
    path.resolve(app.path, 'node_modules/fastboot-express-middleware')
  );
  app.editPackageJSON(function (pkg) {
    pkg.dependencies['fastboot'] = '*';
    pkg.dependencies['fastboot-express-middleware'] = '*';
  });
}

describe('request details', function () {
  this.timeout(300000);

  let app;

  before(function () {
    app = new AddonTestApp();

    return app
      .create('request', {
        emberVersion: '~3.28.12',
        emberDataVersion: '~3.28.12',
      })
      .then(() => injectMiddlewareAddon(app))
      .then(function () {
        return app.startServer({
          command: 'serve',
        });
      });
  });

  after(function () {
    return app.stopServer();
  });

  it('makes host available via a service', function () {
    return request({
      url: 'http://localhost:49741/show-host',
      headers: {
        Accept: 'text/html',
      },
    }).then(function (response) {
      expect(response.body).to.contain('Host: localhost:49741');
      expect(response.body).to.contain(
        'Host from Instance Initializer: localhost:49741'
      );
    });
  });

  it('makes protocol available via a service', function () {
    return request({
      url: 'http://localhost:49741/show-protocol',
      headers: {
        Accept: 'text/html',
      },
    }).then(function (response) {
      expect(response.body).to.contain('Protocol: http:');
      expect(response.body).to.contain(
        'Protocol from Instance Initializer: http:'
      );
    });
  });

  it('makes path available via a service', function () {
    return request({
      url: 'http://localhost:49741/show-path',
      headers: {
        Accept: 'text/html',
      },
    }).then(function (response) {
      expect(response.body).to.contain('Path: /show-path');
      expect(response.body).to.contain(
        'Path from Instance Initializer: /show-path'
      );
    });
  });

  it('makes query params available via a service', function () {
    return request({
      url: 'http://localhost:49741/list-query-params?foo=bar',
      headers: {
        Accept: 'text/html',
      },
    }).then(function (response) {
      expect(response.body).to.contain('Query Params: bar');
      expect(response.body).to.contain(
        'Query Params from Instance Initializer: bar'
      );
    });
  });

  it('makes cookies available via a service', function () {
    let jar = request.jar();
    let cookie = request.cookie('city=Cluj');

    jar.setCookie(cookie, 'http://localhost:49741');

    return request({
      url: 'http://localhost:49741/list-cookies',
      headers: {
        Accept: 'text/html',
      },
      jar: jar,
    }).then(function (response) {
      expect(response.body).to.contain('Cookies: Cluj');
      expect(response.body).to.contain(
        'Cookies from Instance Initializer: Cluj'
      );
    });
  });

  it('makes headers available via a service', function () {
    return request({
      url: 'http://localhost:49741/list-headers',
      headers: {
        'X-FastBoot-info': 'foobar',
        Accept: 'text/html',
      },
    }).then(function (response) {
      expect(response.body).to.contain('Headers: foobar');
      expect(response.body).to.contain(
        'Headers from Instance Initializer: foobar'
      );
    });
  });

  it('makes method available via a service', function () {
    return request({
      url: 'http://localhost:49741/show-method',
      headers: {
        Accept: 'text/html',
      },
    }).then(function (response) {
      expect(response.body).to.contain('Method: GET');
      expect(response.body).to.contain('Method from Instance Initializer: GET');
    });
  });

  it('makes body available via a service', function () {
    return request({
      url: 'http://localhost:49741/show-body',
      method: 'POST',
      headers: {
        Accept: 'text/html',
        'Content-Type': 'text/plain',
      },
      body: 'TEST',
    }).then(function (response) {
      expect(response.body).to.contain('Body: TEST');
      expect(response.body).to.contain('Body from Instance Initializer: TEST');
    });
  });
});
