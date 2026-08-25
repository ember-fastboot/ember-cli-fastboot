import qunit from 'qunit';

import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

qunit.assert.distFile = function (app, filePath) {
  this.pushResult({
    result: existsSync(join(app.dir, 'dist', filePath)),
    expected: filePath,
    actual: readdirSync(join(app.dir, 'dist')),
    message: 'File does not exist',
  });
};

qunit.assert.includes = function (haystack, needle) {
  if (!Array.isArray(haystack)) {
    this.pushResult({
      result: false,
      message: 'you must pass an array to assert.includes',
    });
    return;
  }

  this.pushResult({
    result: haystack.includes(needle),
    expected: needle,
    actual: haystack,
    message: `[${needle}] is missing from the array`,
  });
};
