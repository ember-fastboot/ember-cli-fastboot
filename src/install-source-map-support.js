const sourceMapSupport = require('source-map-support');

function prepareStackTrace(error, stack) {
  return error + stack.map(function(frame) {
    return '\n    at ' + sourceMapSupport.wrapCallSite(frame);
  }).join('');
}

function install(errorClass) {
  if (errorClass) {
    errorClass.prepareStackTrace = prepareStackTrace;
    errorClass.stackTraceLimit = Infinity;
    sourceMapSupport.install({
      environment: 'node',
      handleUncaughtExceptions: false,
    });
  }
}

module.exports = {
  install: install
};
