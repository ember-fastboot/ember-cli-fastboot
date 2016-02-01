var path       = require('path');
var mergeTrees = require('broccoli-merge-trees');
var writeFile  = require('broccoli-file-creator');
var Funnel     = require('broccoli-funnel');

var filterInitializers = require('../broccoli/filter-initializers');
var FastBootConfig     = require('../models/fastboot-config');
var fastbootAppModule  = require('../utilities/fastboot-app-module');

var CONFIG = {
  APP: { autoboot: false }
};

module.exports = {
  ////////////////////////////////
  // EMBER ADDON HOOKS
  //

  included: function(app) {
    this.outputPaths = app.options.outputPaths;
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
      var configTree = this.treeForFastBootConfig();
      tree = mergeTrees([tree, configTree]);
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
  },

  ///////////////////////////////
  // METHODS
  //

  treeForFastBootConfig: function() {
    var config = new FastBootConfig({
      project: this.project,
      outputPaths: this.outputPaths,
      ui: this.ui
    });
    return writeFile('package.json', config.toJSONString());
  }

};
