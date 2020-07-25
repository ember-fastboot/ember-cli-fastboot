'use strict';

const expect = require('chai').use(require('chai-string')).expect;
const RSVP = require('rsvp');
const request = RSVP.denodeify(require('request'));

const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

describe('custom fastboot implementation', function() {
  this.timeout(300000);

  let app;

  before(function() {
    app = new AddonTestApp();

    return app.create('custom-implementation')
      .then(function() {
        return app.startServer({
          command: 'serve'
        });
      });
  });

  after(function() {
    return app.stopServer();
  });

  it('uses custom implementation', function() {
    return request({
      url: 'http://localhost:49741/',
      headers: {
        'Accept': 'text/html'
      }
    })
      .then(function(response) {
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.equal('foobar');
      });
  });
});
