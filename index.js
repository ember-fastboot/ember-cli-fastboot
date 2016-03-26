/* jshint node: true */
'use strict';

var mergeTrees = require('broccoli-merge-trees');

var patchEmberApp     = require('./lib/ext/patch-ember-app');
var fastbootAppModule = require('./lib/utilities/fastboot-app-module');

var filterInitializers = require('./lib/broccoli/filter-initializers');
var FastBootBuild      = require('./lib/broccoli/fastboot-build');
var FastBootConfig     = require('./lib/broccoli/fastboot-config');

/*
 * Main entrypoint for the Ember CLI addon.
 */

module.exports = {
  name: 'ember-cli-fastboot',

  includedCommands: function() {
    return {
      'fastboot':       require('./lib/commands/fastboot'),

      /* fastboot:build is deprecated and will be removed in a future version */
      'fastboot:build': require('./lib/commands/fastboot-build')
    };
  },

  /**
   * Called at the start of the build process to let the addon know it will be
   * used. At this point, we can rely on the EMBER_CLI_FASTBOOT environment
   * variable being set.
   *
   * Once we've determined which mode we're in (browser build or FastBoot build),
   * we mixin additional Ember addon hooks appropriate to the current build target.
   */
  included: function(app) {
    patchEmberApp(app);

    // We serve the index.html from fastboot-dist, so this has to apply to both builds
    app.options.storeConfigInMeta = false;
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
      return "<!-- EMBER_CLI_FASTBOOT_TITLE --><!-- EMBER_CLI_FASTBOOT_HEAD -->";
    }

    if (type === 'app-boot') {
      return fastbootAppModule(config.modulePrefix);
    }
  },

  /**
   * Filters out initializers and instance initializers that should only run in
   * browser mode.
   */
  preconcatTree: function(tree) {
    if (isFastBoot()) {
      return filterInitializers(tree, 'browser', this.app.name);
    } else {
      return filterInitializers(tree, 'fastboot', this.app.name);
    }
  },

  /**
   * After the entire Broccoli tree has been built for the `dist` directory,
   * adds the `fastboot-config.json` file to the root.
   */
  postprocessTree: function(type, tree) {
    if (type === 'all') {
      var fastbootTree = this.buildFastBootTree();

      // Merge the package.json with the existing tree
      return mergeTrees([tree, fastbootTree], {overwrite: true});
    }

    return tree;
  },

  buildConfigTree: function(tree) {
    var env = this.app.env;

    // Create a new Broccoli tree that writes the FastBoot app's
    // `package.json`.
    return new FastBootConfig(tree, {
      project: this.project,
      name: this.app.name,
      assetMapPath: this.assetMapPath,
      ui: this.ui,
      fastbootAppConfig: this.project.config(env).fastboot
    });
  },

  buildFastBootTree: function() {
    var fastbootBuild = new FastBootBuild({
      project: this.project,
      app: this.app,
      parent: this.parent
    });

    return fastbootBuild.toTree();
  }

};

function isFastBoot() {
  return process.env['EMBER_CLI_FASTBOOT'] === 'true';
}
