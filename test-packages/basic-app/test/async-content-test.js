'use strict';

const RSVP = require('rsvp');
const request = RSVP.denodeify(require('request'));
const expect = require('chai').use(require('chai-string')).expect;
const { startServer, stopServer } = require('../../test-libs');

describe('async content via deferred content', function() {
  this.timeout(100000);

  before(function() {
    return startServer();
  });

  after(function() {
    return stopServer();
  });

  it('waits for async content when using `fastboot.deferRendering`', async () => {
    const response = await request({
      url: `http://localhost:45678/async-content`,
      headers: {
        'Accept': 'text/html'
      }
    });

    console.log('body', response.body);

    expect(response.body).to.contain('Async content: Go Sounders');
  });
});
