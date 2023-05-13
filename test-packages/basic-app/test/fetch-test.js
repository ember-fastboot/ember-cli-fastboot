'use strict';

const RSVP = require('rsvp');
const request = RSVP.denodeify(require('request'));
const expect = require('chai').use(require('chai-string')).expect;
const { startServer, stopServer } = require('../../test-libs');

describe('fetch', function () {
  this.timeout(120000);

  before(function () {
    return startServer();
  });

  after(function () {
    return stopServer();
  });

  it('uses fetch', async () => {
    const response = await request({
      url: 'http://localhost:45678/fetch',
      headers: {
        Accept: 'text/html',
      },
    });

    expect(response.statusCode).to.equal(200);
    expect(response.headers['content-type']).to.equalIgnoreCase('text/html; charset=utf-8');
    expect(response.body).to.contain(
      [
        'absolute-url',
        'absolute-request',
        'protocol-relative-url',
        'protocol-relative-request',
        'path-relative-url',
        'path-relative-request',
      ].join('|')
    );
  });
});
