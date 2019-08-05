'use strict';
// Helper to extract the script file name from a given path.
// Used for getting the script filename from the html file, where
// src is set to have custom context or wrapped with a placeholder.
// Examples file paths:
//  "%PLACEHOLDER[c.js]%"
//  "/some_context_path/e.js"
//  "chunk-12.js"
// Expected output for file names: c.js, e.js, chunk-12.js
module.exports = function getScriptFileName(filePath) {
  const scriptFileNameRegEx = /([a-zA-Z0-9_\.\-\(\):])+(\.js)/ig;
  const match = filePath.match(scriptFileNameRegEx);
  return match ? match[0] : '';
}