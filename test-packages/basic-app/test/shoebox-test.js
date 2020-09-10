'use strict';

const RSVP = require('rsvp');
const request = RSVP.denodeify(require('request'));
const expect = require('chai').use(require('chai-string')).expect;
const { startServer, stopServer } = require('../../test-libs/index');

describe.only('shoebox - put', function() {
  this.timeout(20000);

  before(function() {
    return startServer({
      command: 'serve'
    });

  });

  after(function() {
    return stopServer();
  });

  it.only('put items into the shoebox', async () => {
    const response = await request({
      url: 'http://localhost:49741/',
      headers: {
        'Accept': 'text/html'
      }
    })

    expect(response.statusCode).to.equal(200);
    expect(response.body).to.contain(
      '<script type="fastboot/shoebox" id="shoebox-key1">' +
      '{"newZealand":"beautiful"}' +
      '</script>'
    );

    expect(response.body).to.contain(
      '<script type="fastboot/shoebox" id="shoebox-key2">' +
      '{"moa":"20 foot tall bird!"}' +
      '</script>'
    );
  });
});
