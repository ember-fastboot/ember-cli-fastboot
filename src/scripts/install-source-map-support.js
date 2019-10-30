'use strict';
/* globals sourceMapSupport */

Error.prepareStackTrace = function prepareStackTrace(error, stack) {
  return error + stack.map(frame => '\n    at ' + sourceMapSupport.wrapCallSite(frame)).join('');
};
Error.stackTraceLimit = Infinity;

sourceMapSupport.install({
  environment: 'node',
  handleUncaughtExceptions: false,
});
