var path       = require('path');
var existsSync = require('exists-sync');
var debug      = require('debug')('fastboot-test');
var renameSync = require('fs-extra').renameSync;

/*
 * Moves a directory, but only if the target doesn't exist.
 */
module.exports = function moveDirectory(from, to) {
  from = path.resolve(from);

  if (!existsSync(to)) {
    debug("moving directory; from=" + from + "; to=" + to);
    renameSync(from, to);
  }
};
