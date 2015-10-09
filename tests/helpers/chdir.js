"use strict";

var debug = require('debug')('fastboot-test');

module.exports = function(path) {
  debug("chdir; path=" + path);
  process.chdir(path);
};
