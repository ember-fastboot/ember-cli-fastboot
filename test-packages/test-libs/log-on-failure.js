/* global beforeEach, afterEach */
'use strict';

let logSink = [];

if (typeof beforeEach !== 'undefined') {
  beforeEach(function() {
    logSink = [];
  });
}

if (typeof afterEach !== 'undefined') {
  afterEach(function() {
    if (this.currentTest.state !== 'passed') {
      // It would be preferable to attach the log output to the error object
      // (this.currentTest.err) and have Mocha report it somehow, so that the
      // error message and log output show up in the same place. This doesn't
      // seem to be possible though.
      console.log(logSink.join('\n')); // eslint-disable-line no-console
    }
    logSink = [];
  });
}

function logOnFailure(s) {
  logSink.push(s);
}

module.exports = logOnFailure;
