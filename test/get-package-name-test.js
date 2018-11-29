'use strict';
const expect = require('chai').expect;
const getPackageName = require('../src/utils/get-package-name');

describe('utils/get-package-name', function() {
  it('gets package name from module path', function() {
    expect(getPackageName('foo')).to.equal('foo');
    expect(getPackageName('foo/bar')).to.equal('foo');
    expect(getPackageName('@foo/baz')).to.equal('@foo/baz');
    expect(getPackageName('@foo/baz/bar')).to.equal('@foo/baz');
  });
});