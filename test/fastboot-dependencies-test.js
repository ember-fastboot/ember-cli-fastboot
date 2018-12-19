'use strict';

const expect = require('chai').expect;
const fixture = require('./helpers/fixture-path');
const FastBoot = require('./../src/index');

describe("FastBoot with dependencies", function() {
  it("it works with dependencies", function() {
    var fastboot = new FastBoot({
      distPath: fixture('app-with-dependencies')
    });

    return fastboot.visit('/')
      .then(r => r.html())
      .then(html => {
        expect(html).to.match(/https:\/\/emberjs.com/);
        expect(html).to.match(/FOO/);
        expect(html).to.match(/BAR/);
      });
  });
});
