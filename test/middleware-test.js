'use strict';

const expect = require('chai').expect;
const FastBoot = require('fastboot');
const fastbootMiddleware = require('./../src/index');
const fixture = require('./helpers/fixture-path');
const TestHTTPServer = require('./helpers/test-http-server');

describe('FastBoot', function() {
  let server;

  this.timeout(10000);

  afterEach(function() {
    if (server) {
      server.stop();
      server = null;
    }
  });

  it('throws an exception if no distPath is provided', function() {
    let fn = function() {
      fastbootMiddleware();
    };

    expect(fn).to.throw(/You must instantiate FastBoot with a distPath option/);
  });

  it('can provide distPath as the first argument', async function() {
    let middleware = fastbootMiddleware(fixture('basic-app'));
    server = new TestHTTPServer(middleware);
    await server.start();

    let html = await server.request('/');
    expect(html).to.match(/Welcome to Ember/);
  });

  it('can provide distPath as an option', async function() {
    let middleware = fastbootMiddleware({
      distPath: fixture('basic-app'),
    });
    server = new TestHTTPServer(middleware);
    await server.start();

    let html = await server.request('/');
    expect(html).to.match(/Welcome to Ember/);
  });

  it('can be provided with a custom FastBoot instance', async function() {
    let fastboot = new FastBoot({
      distPath: fixture('basic-app'),
    });

    let middleware = fastbootMiddleware({
      fastboot: fastboot,
    });

    server = new TestHTTPServer(middleware);
    await server.start();

    let html = await server.request('/');
    expect(html).to.match(/Welcome to Ember/);
  });

  it('can reload the FastBoot instance', async function() {
    let fastboot = new FastBoot({
      distPath: fixture('basic-app'),
    });

    let middleware = fastbootMiddleware({
      fastboot: fastboot,
    });

    server = new TestHTTPServer(middleware);
    await server.start();

    let html = await server.request('/');
    expect(html).to.match(/Welcome to Ember/);

    fastboot.reload({
      distPath: fixture('hot-swap-app'),
    });

    html = await server.request('/');
    expect(html).to.match(/Goodbye from Ember/);
  });

  it('it appends multivalue headers', async function() {
    let middleware = fastbootMiddleware(fixture('multivalue-headers'));
    server = new TestHTTPServer(middleware);
    await server.start();

    let { headers } = await server.request('/', { resolveWithFullResponse: true });
    expect(headers['x-fastboot']).to.eq('a, b, c');
  });

  /* eslint-disable mocha/no-setup-in-describe */
  [true, false].forEach(chunkedResponse => {
    describe(`when chunked response is ${chunkedResponse ? 'enabled' : 'disabled'}`, function() {
      if (chunkedResponse) {
        it('responds with a chunked response', async function() {
          let middleware = fastbootMiddleware({
            distPath: fixture('basic-app'),
            chunkedResponse,
          });
          server = new TestHTTPServer(middleware, { errorHandling: true });
          await server.start();

          let { body, headers } = await server.request('/', { resolveWithFullResponse: true });
          expect(headers['transfer-encoding']).to.eq('chunked');
          expect(body).to.match(/Welcome to Ember/);
        });
      }

      it("returns 404 when navigating to a URL that doesn't exist", async function() {
        let middleware = fastbootMiddleware({
          distPath: fixture('basic-app'),
          chunkedResponse,
        });
        server = new TestHTTPServer(middleware);
        await server.start();

        try {
          await server.request('/foo-bar-baz/non-existent');
        } catch (error) {
          expect(error.statusCode).to.equal(404);
        }
      });

      it('returns a 500 error if an error occurs', async function() {
        let middleware = fastbootMiddleware({
          distPath: fixture('rejected-promise'),
          chunkedResponse,
        });
        server = new TestHTTPServer(middleware);
        await server.start();

        try {
          await server.request('/');
        } catch (error) {
          expect(error.message).to.match(/Rejected on purpose/);
        }
      });

      describe('when resilient mode is enabled', function() {
        it('renders no FastBoot markup', async function() {
          let middleware = fastbootMiddleware({
            distPath: fixture('rejected-promise'),
            resilient: true,
            chunkedResponse,
          });
          server = new TestHTTPServer(middleware);
          await server.start();

          let html = await server.request('/');
          expect(html).to.not.match(/error/);
        });

        it('propagates to error handling middleware', async function() {
          let middleware = fastbootMiddleware({
            distPath: fixture('rejected-promise'),
            resilient: true,
            chunkedResponse,
          });
          server = new TestHTTPServer(middleware, { errorHandling: true });
          await server.start();

          let { body, statusCode, headers } = await server.request('/', {
            resolveWithFullResponse: true,
          });
          expect(statusCode).to.equal(200);
          expect(headers['x-test-error']).to.match(/error handler called/);
          expect(body).to.match(/hello world/);
        });

        it('is does not propagate errors when and there is no error handling middleware', async function() {
          let middleware = fastbootMiddleware({
            distPath: fixture('rejected-promise'),
            resilient: true,
            chunkedResponse,
          });
          server = new TestHTTPServer(middleware, { errorHandling: false });
          await server.start();

          let { body, statusCode, headers } = await server.request('/', {
            resolveWithFullResponse: true,
          });
          expect(statusCode).to.equal(200);
          expect(headers['x-test-error']).to.not.match(/error handler called/);
          expect(body).to.not.match(/error/);
          expect(body).to.match(/hello world/);
        });

        it('allows post-fastboot middleware to recover the response when it fails', async function() {
          let middleware = fastbootMiddleware({
            distPath: fixture('rejected-promise'),
            resilient: true,
            chunkedResponse,
          });
          server = new TestHTTPServer(middleware, { recoverErrors: true });
          await server.start();

          let { body, statusCode, headers } = await server.request('/', {
            resolveWithFullResponse: true,
          });
          expect(statusCode).to.equal(200);
          expect(headers['x-test-recovery']).to.match(/recovered response/);
          expect(body).to.match(/hello world/);
        });
      });

      describe('when resilient mode is disabled', function() {
        it('propagates to error handling middleware', async function() {
          let middleware = fastbootMiddleware({
            distPath: fixture('rejected-promise'),
            resilient: false,
            chunkedResponse,
          });
          server = new TestHTTPServer(middleware, { errorHandling: true });
          await server.start();

          try {
            await server.request('/', {
              resolveWithFullResponse: true,
            });
          } catch ({ statusCode, response: { headers } }) {
            expect(statusCode).to.equal(500);
            expect(headers['x-test-error']).to.match(/error handler called/);
          }
        });

        it('allows post-fastboot middleware to recover the response when it fails', async function() {
          let middleware = fastbootMiddleware({
            distPath: fixture('rejected-promise'),
            resilient: false,
            chunkedResponse,
          });
          server = new TestHTTPServer(middleware, { recoverErrors: true });
          await server.start();

          let { body, statusCode, headers } = await server.request('/', {
            resolveWithFullResponse: true,
          });
          expect(statusCode).to.equal(200);
          expect(headers['x-test-recovery']).to.match(/recovered response/);
          expect(body).to.match(/hello world/);
        });
      });
    });
  });
  /* eslint-enable mocha/no-setup-in-describe */
});
