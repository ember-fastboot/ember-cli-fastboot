'use strict';

const RSVP = require('rsvp');
const request = RSVP.denodeify(require('request'));
const expect = require('chai').use(require('chai-string')).expect;
const { startServer, stopServer } = require('../../test-libs/index');

describe.only('simple acceptance', function() {
  this.timeout(5000);

  before(function() {
    return startServer({
      command: 'serve'
    });

  });

  after(function() {
    return stopServer();
  });

  it('/ HTML contents', async () => {
    const response = await request({
      url: 'http://localhost:49741/',
      headers: {
        'Accept': 'text/html'
      }
    })

    expect(response.statusCode).to.equal(200);
    expect(response.headers["content-type"]).to.equalIgnoreCase("text/html; charset=utf-8");
    expect(response.body).to.contain("Basic fastboot ember app");
  });
});
