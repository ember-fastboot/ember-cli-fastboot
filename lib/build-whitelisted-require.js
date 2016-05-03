'use strict';

const path = require('path');
const existsSync = require('exists-sync');

module.exports = function buildWhitelistedRequire(whitelist, distPath) {
  return function(moduleName) {
    if (whitelist.indexOf(moduleName) > -1) {
      let nodeModulesPath = path.join(distPath, 'node_modules', moduleName);

      if (existsSync(nodeModulesPath)) {
        return require(nodeModulesPath);
      } else {
        // Assume its a built in module
        return require(moduleName);
      }
    } else {
      throw new Error("Unable to require module '" + moduleName + "' because it was not in the whitelist.");
    }
  };
};
