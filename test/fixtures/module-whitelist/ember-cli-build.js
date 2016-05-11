module.exports = function(defaults) {
  var EmberApp = require('ember-cli/lib/broccoli/ember-app');
  var app = new EmberApp(defaults, {
    fingerprint: {
      generateAssetMap: true
    }
  });

  return app.toTree();
};
