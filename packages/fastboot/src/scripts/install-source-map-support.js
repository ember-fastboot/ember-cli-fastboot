'use strict';
/* globals sourceMapSupport */

Error.stackTraceLimit = Infinity;

sourceMapSupport.install({
  environment: 'node',
  emptyCacheBetweenOperations: true,
  handleUncaughtExceptions: false,
});
