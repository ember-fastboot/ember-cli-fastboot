/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {});

  app.import('vendor/fastboot-incompatible.js', {
    using: [
      {
        transformation: 'fastbootShim'
      }
    ]
  });

  return app.toTree();
};
