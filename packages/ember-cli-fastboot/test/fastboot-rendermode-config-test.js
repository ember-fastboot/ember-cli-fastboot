'use strict';

const expect = require('chai').use(require('chai-string')).expect;
const RSVP = require('rsvp');
const request = RSVP.denodeify(require('request'));

const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

describe('FastBoot renderMode config', function() {
  this.timeout(400000);

  let app;

  before(function() {
    app = new AddonTestApp();

    return app.create('fastboot-rendermode-config', { emberVersion: 'latest'})
      .then(function() {
        return app.startServer({
          command: 'serve'
        });
      });
  });

  after(function() {
    return app.stopServer();
  });

  it('uses rehydration when rendermode is serialize', function() {
    return request({
      url: 'http://localhost:49741/dynamic',
      headers: {
        'Accept': 'text/html'
      }
    })
      .then(function(response) {
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.equalIgnoreCase('text/html; charset=utf-8');
        expect(response.body).to.contain('<!--%+b:7%-->magic<!--%-b:7%-->');
      });
  });
});
