var expect = require('chai').expect;
var path = require('path');
var FastBootHeaders = require('../lib/fastboot-headers.js');

describe('FastBootHeaders', function() {
  it('returns an array of header values from getAll, regardless of header name casing', function() {
    var headers = {
      // Express concatenates repeated keys with ', '
      // and also lowercases the keys
      'x-test-header': 'value1, value2'
    };
    var headers = new FastBootHeaders(headers);

    expect(headers.getAll('X-Test-Header')).to.deep.equal(['value1', 'value2']);
    expect(headers.getAll('x-test-header')).to.deep.equal(['value1', 'value2']);
  });

  it('returns an emtpy array when a header is not present', function() {
    var headers = {
      // Express concatenates repeated keys with ', '
      // and also lowercases the keys
      'x-test-header': 'value1, value2'
    };
    var headers = new FastBootHeaders(headers);

    expect(headers.getAll('Host')).to.deep.equal([]);
    expect(headers.getAll('host')).to.deep.equal([]);
  });

  it('returns the first value when using get, regardless of case', function() {
    var headers = {
      // Express concatenates repeated keys with ', '
      // and also lowercases the keys
      "x-test-header": "value1, value2"
    };
    var headers = new FastBootHeaders(headers);

    expect(headers.get('X-Test-Header')).to.equal('value1');
    expect(headers.get('x-test-header')).to.equal('value1');
  });

  it('returns null when using get when a header is not present', function() {
    var headers = {
      // Express concatenates repeated keys with ', '
      // and also lowercases the keys
      "x-test-header": "value1, value2"
    };
    var headers = new FastBootHeaders(headers);

    expect(headers.get('Host')).to.be.null;
    expect(headers.get('host')).to.be.null;
  });

  it('returns whether or not a header is present via has, regardless of case', function() {
    var headers = {
      // Express concatenates repeated keys with ', '
      // and also lowercases the keys
      "x-test-header": "value1, value2"
    };
    var headers = new FastBootHeaders(headers);

    expect(headers.has('X-Test-Header')).to.be.true;
    expect(headers.has('x-test-header')).to.be.true;
    expect(headers.has('Host')).to.be.false;
    expect(headers.has('host')).to.be.false;
  });
});

