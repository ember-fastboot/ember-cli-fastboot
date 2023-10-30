'use strict';

const RSVP = require('rsvp');
const request = RSVP.denodeify(require('request'));
const expect = require('chai').use(require('chai-string')).expect;
const { startServer, stopServer } = require('../../test-libs');

describe('error handler acceptance', function() {
  this.timeout(100000);

  before(function() {
    return startServer();
  });

  after(function() {
    return stopServer();
  });

  it('visiting `/error-route` does not result in an error`', async () => {
    const response = await request({
      url: `http://localhost:45678/error-route`,
      headers: {
        'Accept': 'text/html'
      }
    });

    expect(response.statusCode).to.equal(200);
  });
});
