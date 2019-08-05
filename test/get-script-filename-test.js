'use strict';
const { expect } = require('chai');
const getScriptFileName = require('../lib/utilities/get-script-file-name');

describe('utilities/get-script-file-name', function() {
  let filePaths = [
    'a.js',
    '"%PLACEHOLDER[c.js]%"',
    '/some_context_path/e.js',
    'chunk-12.js"',
    'assets/vendor.js',
    '/some_context_path/vendor-static.js'
  ]
  it('can parse different script filePaths and return script filenames', () => {
    let fileNames = filePaths.map((filePath) => getScriptFileName(filePath));
    expect(fileNames).to.deep.equal([
      'a.js',
      'c.js',
      'e.js',
      'chunk-12.js',
      'vendor.js',
      'vendor-static.js'
    ]);
  });
});