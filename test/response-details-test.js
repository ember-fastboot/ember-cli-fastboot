'use strict';

const chai = require('chai');
const expect = chai.expect;
const RSVP = require('rsvp');
const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;
const request = require('request');
const get = RSVP.denodeify(request);

describe('response details', function() {
  this.timeout(300000);

  let app;

  before(function() {

    app = new AddonTestApp();

    return app.create('response')
      .then(function() {
        return app.startServer({
          command: 'serve'
        });
      });
  });

  after(function() {
    return app.stopServer();
  });

  it('makes headers available via a service', function() {
    return get({
      url: 'http://localhost:49741/echo-request-headers',
      headers: {
        'X-FastBoot-echo': 'i-should-be-echoed-back',
        'Accept': 'text/html'
      }
    })
      .then(function(response) {
        expect(response.headers).to.include.keys('x-fastboot-echoed-back');
        expect(response.headers['x-fastboot-echoed-back']).to.include('i-should-be-echoed-back');
      });
  });

  it('makes the status code available via a service', function() {
    return get({
      url: 'http://localhost:49741/return-status-code-418',
      headers: {
        'Accept': 'text/html'
      }
    })
      .then(function(response) {
        expect(response.statusCode).to.equal(418);
      });
  });

  it('the body is contained between markers', function () {
    return get({
      url: 'http://localhost:49741/',
      headers: {
        'Accept': 'text/html'
      }
    })
      .then(function (response) {
        expect(response.body).to.contain('<script type="x/boundary" id="fastboot-body-start"></script>')
        expect(response.body).to.contain('<script type="x/boundary" id="fastboot-body-end"></script>')
      });
  });
});
