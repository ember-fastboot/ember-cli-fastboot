'use strict';

const expect         = require('chai').expect;
const fs             = require('fs');
const path           = require('path');
const request        = require('request-promise');
const TestHTTPServer = require('./helpers/test-http-server');
const alchemistRequire = require('broccoli-module-alchemist/require');
const FastBoot       = alchemistRequire('index');

describe("FastBootShoebox", function() {

  it("can render the shoebox HTML", function() {
    var fastboot = new FastBoot({
      distPath: fixture('shoebox')
    });

    return fastboot.visit('/')
      .then(r => r.html())
      .then(html => {
        expect(html).to.match(/<script type="fastboot\/shoebox" id="shoebox-key1">{"foo":"bar"}<\/script>/);
        expect(html).to.match(/<script type="fastboot\/shoebox" id="shoebox-key2">{"zip":"zap"}<\/script>/);
      });
  });

});

function fixture(fixtureName) {
  return path.join(__dirname, '/fixtures/', fixtureName);
}
