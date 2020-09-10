'use strict';

const path = require('path');
const findup = require('findup-sync');
const runCommand = require('./run-command');

module.exports = function(command, options) {
  let emberCLIPath = findup('node_modules/ember-cli');

  let args = [path.join(emberCLIPath, 'bin', 'ember'), command].concat(options);

  return runCommand.apply(undefined, args);
};
