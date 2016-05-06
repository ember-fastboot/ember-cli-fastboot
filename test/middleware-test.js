'use strict';

const expect             = require('chai').expect;
const path               = require('path');
const FastBoot           = require('fastboot');
const fastbootMiddleware = require('../index');
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

  it("renders an empty page if the resilient flag is set", function() {
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
});
