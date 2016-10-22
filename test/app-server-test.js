"use strict";

const path              = require('path');
const fork              = require('child_process').fork;
const expect            = require('chai').expect;
const alchemistRequire  = require('broccoli-module-alchemist/require');
const FastBootAppServer = alchemistRequire('fastboot-app-server');
const request           = require('request-promise').defaults({ simple: false, resolveWithFullResponse: true });

let server;

describe("FastBootAppServer", function() {
  this.timeout(3000);

  afterEach(function() {
    if (server) {
      server.kill();
    }
  });

  it("throws if no distPath or downloader is provided", function() {
    expect(() => {
      new FastBootAppServer();
    }).to.throw(/must be provided with either a distPath or a downloader/);
  });

  it("throws if both a distPath and downloader are provided", function() {
    expect(() => {
      new FastBootAppServer({
        downloader: {},
        distPath: 'some/dist/path'
      });
    }).to.throw(/FastBootAppServer must be provided with either a distPath or a downloader option, but not both/);
  });

  it("serves an HTTP 500 response if the app can't be found", function() {
    return runServer('not-found-server')
      .then(() => request('http://localhost:3000'))
      .then(response => {
        expect(response.statusCode).to.equal(500);
        expect(response.body).to.match(/No Application Found/);
      });
  });

  it("serves static assets", function() {
    return runServer('basic-app-server')
      .then(() => request('http://localhost:3000/assets/fastboot-test.js'))
      .then(response => {
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.contain('"use strict";');
      })
      .then(() => request('http://localhost:3000/'))
      .then(response => {
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.contain('Welcome to Ember');
      });
  });

  it("returns a 404 status code for non-existent assets",  function() {
    return runServer('basic-app-server')
      .then(() => request('http://localhost:3000/assets/404-does-not-exist.js'))
      .then(response => {
        expect(response.statusCode).to.equal(404);
        expect(response.body).to.match(/Not Found/);
      })
      .then(() => request('http://localhost:3000/'))
      .then(response => {
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.contain('Welcome to Ember');
      });
  });

  it("executes beforeMiddleware", function() {
    return runServer('before-middleware-server')
      .then(() => request('http://localhost:3000'))
      .then(response => {
        expect(response.statusCode).to.equal(418);
        expect(response.headers['x-test-header']).to.equal('testing');
        expect(response.body).to.equal(JSON.stringify({ send: 'json back'}));
      });
  });

  it("executes afterMiddleware when there is an error", function() {
    return runServer('after-middleware-server')
      .then(() => request('http://localhost:3000'))
      .then(response => {
        expect(response.body).to.not.match(/error/);
        expect(response.headers['x-test-header']).to.equal('testing');
      })
  });

});

function runServer(name) {
  return new Promise((res, rej) => {
    let serverPath = path.join(__dirname, 'fixtures', `${name}.js`);
    server = fork(serverPath, {
      silent: true
    });

    server.on('error', rej);

    server.stdout.on('data', data => {
      if (data.toString().match(/HTTP server started/)) {
        res();
      }
    });

    server.stderr.on('data', data => {
      console.log(data.toString());
    });

    server.stdout.on('data', data => {
      console.log(data.toString());
    });
  });
}
