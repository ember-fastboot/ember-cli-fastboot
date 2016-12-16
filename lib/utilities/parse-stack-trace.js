/*
 * Helper function that parses the stack trace of an Error object
 * and extracts the file name and line number where the exception
 * was thrown.
 */
module.exports = function(e) {
  // If there's a stack trace available, try to extract some information for
  // it so we can generate a more helpful error message.
  var fileName = null;
  var lineNumber = null;

  if (e && e.stack) {
    // Look at the stack trace line by line
    var stack = e.stack.split('\n');

    // Verify there's a second line with path information.
    // (First line is the error message itself.)
    if (stack[1]) {
      // Extract path and line number information. An example line looks like either:
      //     at /Users/monegraph/Code/fastboot-test/dist/fastboot/vendor.js:65045:19
      // or
      //     at Module.callback (/Users/monegraph/Code/fastboot-test/dist/fastboot/fastboot-test.js:23:31)
      var match = stack[1].match(/\s*(?:at .* \(([^:]+):(\d+):(\d+)|at ([^:]+):(\d+):(\d+)$)/);
      if (match) {
        fileName = match[1] || match[4];
        lineNumber = match[2] || match[5];
      }
    }
  }

  return {
    fileName: fileName,
    lineNumber: lineNumber === null ? lineNumber : parseInt(lineNumber, 10)
  };
};
