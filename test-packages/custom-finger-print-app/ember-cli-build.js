'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
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
    },

    fingerprint: {
      prepend: 'https://totally-sick-cdn.example.com/',
      exclude: ['vendor.js', 'custom-app-fastboot.js'],
      generateAssetMap: true,
      assetMapPath: 'totally-customized-asset-map.json'
    }
  });

  return app.toTree();
};
