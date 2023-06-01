/* eslint-disable no-redeclare, prettier/prettier */
/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    outputPaths: {
      app: {
        html: 'index.html',
        css: {
          'app': '/some-assets/path/app.css',
        },
        js: '/some-assets/path/app-file.js'
      },
      vendor: {
        js: '/some-assets/path/lib.js'
      }
    }
  });

  return app.toTree();
};
