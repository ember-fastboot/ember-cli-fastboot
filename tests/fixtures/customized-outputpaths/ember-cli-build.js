/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    outputPaths: {
      app: {
        html: 'index.html',
        css: {
          'app': '/assets/app.css',
        },
        js: '/assets/app.js'
      },
      vendor: {
        js: '/assets/lib.js'
      }
    }
  });

  return app.toTree();
};
