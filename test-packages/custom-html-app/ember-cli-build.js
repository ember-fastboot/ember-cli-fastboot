'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    fingerprint: {
      prepend: 'https://totally-sick-cdn.example.com/',
      exclude: ['vendor.js', 'custom-output-path-app-fastboot.js'],
      generateAssetMap: true,
      assetMapPath: 'totally-customized-asset-map.json'
    }
  });

  return app.toTree();
};
