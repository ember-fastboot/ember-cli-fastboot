var path       = require('path');
var mergeTrees = require('broccoli-merge-trees');
var Funnel     = require('broccoli-funnel');

var filterInitializers = require('../broccoli/filter-initializers');
var FastBootConfig     = require('../broccoli/fastboot-config');
var fastbootAppModule  = require('../utilities/fastboot-app-module');

var CONFIG = {
  APP: { autoboot: false }
};

module.exports = {
  ////////////////////////////////
  // EMBER ADDON HOOKS
  //

  included: function(app) {
    // Save some information off from the build configuration:
    // 1. The paths to various JavaScript and HTML files
    this.outputPaths = app.options.outputPaths;
    // 2. The path to the asset map, if `broccoli-asset-rev` is being used
    this.assetMapPath = app.options.fingerprint.assetMapPath;

    // Always generate an asset map. Otherwise, we have no way of knowing where
    // `broccoli-asset-rev` moved our stuff.
    app.options.fingerprint.generateAssetMap = true;
  },

  /**
   * Augments the applications configuration settings. The object returned from
   * this hook is merged with the application's configuration object.
   * Application's configuration always take precedence.
   */
  config: function() {
    return CONFIG;
  },

  preconcatTree: function(tree) {
    return new Funnel(tree, {
      annotation: 'Funnel: Remove browser-only initializers',
      exclude: [
        path.join(this.app.name, 'initializers/browser/*'),
        path.join(this.app.name, 'instance-initializers/browser/*')
      ]
    });
  },

  /**
   * After the entire Broccoli tree has been built for the `dist` directory,
   * adds the `fastboot-config.json` file to the root.
   */
  postprocessTree: function(type, tree) {
    if (type === 'all') {
      // Create a new Broccoli tree that writes the FastBoot app's
      // `package.json`.
      var config = new FastBootConfig(tree, {
        project: this.project,
        outputPaths: this.outputPaths,
        assetMapPath: this.assetMapPath,
        ui: this.ui
      });

      // Merge the package.json with the existing tree
      return mergeTrees([config, tree]);
    }

    return tree;
  },

  /**
   * Filters out initializers and instance initializers that should only run in
   * browser mode.
   */
  treeForApp: function(tree) {
    return filterInitializers(tree, 'browser');
  },

  /**
   * Inserts placeholders into index.html that are used by the FastBoot server
   * to insert the rendered content into the right spot. Also injects a module
   * for FastBoot application boot.
   */
  contentFor: function(type, config) {
    if (type === 'body') {
      return "<!-- EMBER_CLI_FASTBOOT_BODY -->";
    }

    if (type === 'head') {
      return "<!-- EMBER_CLI_FASTBOOT_TITLE -->";
    }

    if (type === 'app-boot') {
      return fastbootAppModule(config.modulePrefix);
    }
  }


};
