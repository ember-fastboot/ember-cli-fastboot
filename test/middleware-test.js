'use strict';

const expect             = require('chai').expect;
const path               = require('path');
const FastBoot           = require('fastboot');
const alchemistRequire   = require('broccoli-module-alchemist/require');
const fastbootMiddleware = alchemistRequire('index');
const fixture            = require('./helpers/fixture-path');
const TestHTTPServer     = require('./helpers/test-http-server');

describe("FastBoot", function() {
  let server;

  this.timeout(10000);

  afterEach(function() {
    if (server) {
      server.stop();
      server = null;
    }
  });

  it("throws an exception if no distPath is provided", function() {
    let fn = function() {
      fastbootMiddleware();
    };

    expect(fn).to.throw(/You must instantiate FastBoot with a distPath option/);
  });

  it("can provide distPath as the first argument", function() {
    let middleware = fastbootMiddleware(fixture('basic-app'));
    server = new TestHTTPServer(middleware);

    return server.start()
      .then(() => server.request('/'))
      .then(html => {
        expect(html).to.match(/Welcome to Ember/);
      });
  });

  it("can provide distPath as an option", function() {
    let middleware = fastbootMiddleware({
      distPath: fixture('basic-app')
    });
    server = new TestHTTPServer(middleware);

    return server.start()
      .then(() => server.request('/'))
      .then(html => {
        expect(html).to.match(/Welcome to Ember/);
      });
  });

  it("returns 404 when navigating to a URL that doesn't exist", function() {
    let middleware = fastbootMiddleware(fixture('basic-app'));
    server = new TestHTTPServer(middleware);

    return server.start()
      .then(() => server.request('/foo-bar-baz/non-existent'))
      .catch((result) => {
        expect(result.statusCode).to.equal(404);
      });
  });

  it("returns a 500 error if an error occurs", function() {
    let middleware = fastbootMiddleware({
      distPath: fixture('rejected-promise')
    });
    server = new TestHTTPServer(middleware);

    return server.start()
      .then(() => server.request('/'))
      .catch(err => {
        expect(err.message).to.match(/Rejected on purpose/);
      });
  });

  it("can be provided with a custom FastBoot instance", function() {
    let fastboot = new FastBoot({
      distPath: fixture('basic-app')
    });

    let middleware = fastbootMiddleware({
      fastboot: fastboot
    });

    server = new TestHTTPServer(middleware);

    return server.start()
      .then(() => server.request('/'))
      .then(html => {
        expect(html).to.match(/Welcome to Ember/);
      });
  });

  it("can reload the FastBoot instance", function() {
    let fastboot = new FastBoot({
      distPath: fixture('basic-app')
    });

    let middleware = fastbootMiddleware({
      fastboot: fastboot
    });

    server = new TestHTTPServer(middleware);

    return server.start()
      .then(requestFirstApp)
      .then(hotReloadApp)
      .then(requestSecondApp);

    function requestFirstApp(info) {
      return server.request('/')
        .then(function(html) {
          expect(html).to.match(/Welcome to Ember/);
        });
    }

    function hotReloadApp() {
      fastboot.reload({
        distPath: fixture('hot-swap-app')
      });
    }

    function requestSecondApp(info) {
      return server.request('/')
        .then(function(html) {
          expect(html).to.match(/Goodbye from Ember/);
        });
    }
  });

  describe('when reslient mode is enabled', function () {
    it("renders no FastBoot markup", function() {
      let middleware = fastbootMiddleware({
        distPath: fixture('rejected-promise'),
        resilient: true
      });
      server = new TestHTTPServer(middleware);

      return server.start()
        .then(() => server.request('/'))
        .then(html => {
          expect(html).to.not.match(/error/);
        });
    });

    it("propagates to error handling middleware", function() {
      let middleware = fastbootMiddleware({
        distPath: fixture('rejected-promise'),
        resilient: true
      });
      server = new TestHTTPServer(middleware, { errorHandling: true });

      return server.start()
        .then(() => server.request('/', { resolveWithFullResponse: true }))
        .then(({ body, statusCode, headers }) => {
          expect(statusCode).to.equal(200);
          expect(headers['x-test-error']).to.match(/error handler called/);
          expect(body).to.match(/hello world/);
        });
    });

    it("is does not propagate errors when and there is no error handling middleware", function() {
      let middleware = fastbootMiddleware({
        distPath: fixture('rejected-promise'),
        resilient: true,
      });
      server = new TestHTTPServer(middleware, { errorHandling: false });

      return server.start()
        .then(() => server.request('/', { resolveWithFullResponse: true }))
        .then(({ body, statusCode, headers }) => {
          expect(statusCode).to.equal(200);
          expect(headers['x-test-error']).to.not.match(/error handler called/);
          expect(body).to.not.match(/error/);
          expect(body).to.match(/hello world/);
        });
    });

    it("allows post-fastboot middleware to recover the response when it fails", function() {
      let middleware = fastbootMiddleware({
        distPath: fixture('rejected-promise'),
        resilient: true
      });
      server = new TestHTTPServer(middleware, { recoverErrors: true });

      return server.start()
        .then(() => server.request('/', { resolveWithFullResponse: true }))
        .then(({ body, statusCode, headers }) => {
          expect(statusCode).to.equal(200);
          expect(headers['x-test-recovery']).to.match(/recovered response/);
          expect(body).to.match(/hello world/);
        });
    });
  });

  describe('when reslient mode is disabled', function () {
    it("propagates to error handling middleware", function() {
      let middleware = fastbootMiddleware({
        distPath: fixture('rejected-promise'),
        resilient: false,
      });
      server = new TestHTTPServer(middleware, { errorHandling: true });

      return server.start()
        .then(() => server.request('/', { resolveWithFullResponse: true }))
        .catch(({ statusCode, response: { headers } }) => {
          expect(statusCode).to.equal(500);
          expect(headers['x-test-error']).to.match(/error handler called/);
        });
    });

    it("allows post-fastboot middleware to recover the response when it fails", function() {
      let middleware = fastbootMiddleware({
        distPath: fixture('rejected-promise'),
        resilient: false
      });
      server = new TestHTTPServer(middleware, { recoverErrors: true });

      return server.start()
        .then(() => server.request('/', { resolveWithFullResponse: true }))
        .then(({ body, statusCode, headers }) => {
          expect(statusCode).to.equal(200);
          expect(headers['x-test-recovery']).to.match(/recovered response/);
          expect(body).to.match(/hello world/);
        });
    });
  });

});
