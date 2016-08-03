var parseStackTrace = require('../lib/utilities/parse-stack-trace.js');
var expect = require('chai').expect;

describe('parsing stack traces', function() {
  it('handles null exception', function() {
    var result = parseStackTrace(null);
    expect(result.fileName).to.equal(null);
    expect(result.lineNumber).to.equal(null);
  });

  it('handles Error without stack trace', function() {
    var result = parseStackTrace({});
    expect(result.fileName).to.equal(null);
    expect(result.lineNumber).to.equal(null);
  });

  it('handles path without function name', function() {
    var err = {
      stack: 'ReferenceError: Too much cool\n' +
             '     at /Users/monegraph/Code/fastboot-test/dist/fastboot/vendor.js:65045:19'
    };

    var result = parseStackTrace(err);
    expect(result.fileName).to.equal('/Users/monegraph/Code/fastboot-test/dist/fastboot/vendor.js');
    expect(result.lineNumber).to.equal(65045);
  });

  it('handles path with space in path', function() {
    var err = {
      stack: 'ReferenceError: Too much cool\n' +
             '     at /Users/mone graph/Code/fastboot-test/dist/fastboot/vendor.js:65045:19'
    };

    var result = parseStackTrace(err);
    expect(result.fileName).to.equal('/Users/mone graph/Code/fastboot-test/dist/fastboot/vendor.js');
    expect(result.lineNumber).to.equal(65045);
  });

  it('handles path with function name', function() {
    var err = {
      stack: 'ReferenceError: Too much cool\n' +
             '     at Module.callback (/Users/monegraph/Code/fastboot-test/dist/fastboot/fastboot-test.js:23:31)'
    };

    var result = parseStackTrace(err);
    expect(result.fileName).to.equal('/Users/monegraph/Code/fastboot-test/dist/fastboot/fastboot-test.js');
    expect(result.lineNumber).to.equal(23);
  });
});
