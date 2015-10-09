"use strict";

var temp = require('temp').track();
var runCommand       = require('./helpers/run-command');
var path = require('path');

var tmpDir = temp.mkdirSync();
var root = process.cwd();
var moveDirectory    = require('./helpers/move-directory');
var symlinkDirectory = require('./helpers/symlink-directory');

process.chdir(tmpDir);

var name = 'precooked-app';
var args = [path.join(__dirname, '../node_modules/ember-cli/', 'bin', 'ember'), 'new', '--disable-analytics', '--watcher=node', '--skip-git', name];
runCommand.apply(undefined, args).then(function() {
  moveDirectory(path.join(tmpDir, name, 'node_modules'), path.join(root, 'tmp', 'precooked_node_modules'));
})
.then(function() {
  symlinkDirectory(root, path.join(root, 'tmp', 'precooked_node_modules', 'ember-cli-fastboot'));
})
.catch(function(e) {
  console.log(e);
});
