'use strict';

const RSVP = require('rsvp');
const request = RSVP.denodeify(require('request'));
const expect = require('chai').use(require('chai-string')).expect;
const { startServer, stopServer } = require('../../test-libs');

describe('head content acceptance', function() {
  this.timeout(100000);

  before(function() {
    return startServer();
  });

  after(function() {
    return stopServer();
  });

  it('has head content replaced`', async () => {
    const response = await request({
      url: `http://localhost:45678/head-content`,
      headers: {
        'Accept': 'text/html'
      }
    });

    expect(response.statusCode).to.equal(200);
    expect(response.headers["content-type"]).to.equalIgnoreCase("text/html; charset=utf-8");
    expect(response.body).to.contain('<meta property="og:title" content="Go Sounders">');
    expect(response.body).to.not.contain('<!-- EMBER_CLI_FASTBOOT_HEAD -->');
  });
});
