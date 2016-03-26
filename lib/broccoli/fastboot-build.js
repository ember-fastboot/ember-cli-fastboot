var Funnel    = require('broccoli-funnel');
var cloneDeep = require('lodash.clonedeep');
var find      = require('lodash.find');
var Plugin = require('broccoli-plugin');

// The EmptyTree just returns a broccoli tree with no files
// into it so broccoli doesn't try to read a tree from
// undefined.
EmptyTree.prototype = Object.create(Plugin.prototype);
EmptyTree.prototype.constructor = EmptyTree;
function EmptyTree(inputNodes, options) {
  options = options || {};
  this.persistentOutput = options.persistentOutput = true;
  Plugin.call(this, inputNodes, options);
  this.options = options;
}

EmptyTree.prototype.build = function() { };

function FastBootBuild(options) {
  this.options = options;
  this.project = options.project;
  this.app = options.app;
  this.parent = options.parent;
}

/**
 * Creates a new EmberApp instance (from Ember CLI) and configures it to build
 * for FastBoot. This tree for the FastBoot build is returned and later merged
 * with the initial browser build.
 */
FastBootBuild.prototype.toTree = function() {
  var env = process.env;

  // This method will be called again when we create the new EmberApp below.
  // This is to prevent infinite recursion.
  if (this.app.options.__is_building_fastboot__) {
    return new EmptyTree([]);
  }

  // Set the EMBER_CLI_FASTBOOT environment variable. This serves as a hint
  // for other addons that they should build their trees configured for the
  // FastBoot build.
  //
  // In the future, ideally we can remove this environment variable and there
  // would be a more explicit way to tell addons what the build target is.
  env.EMBER_CLI_FASTBOOT = true;

  var options = this.appOptions();

  // re-require with env.EMBER_CLI_FASTBOOT on
  var path = require('path');
  var emberBuildFile = path.join(this.project.root, 'ember-cli-build.js');
  var emberApp = require(emberBuildFile)(options);

  // Because this will be merged with the browser build, move the FastBoot
  // build's assets to the fastboot directory.
  var fastbootTree = new Funnel(emberApp, {
    srcDir: 'assets',
    destDir: 'fastboot',
    include: ['**/*.js']
  });

  delete env.EMBER_CLI_FASTBOOT;
  delete this.app.options.__is_building_fastboot__;

  return this.rewriteAssets(fastbootTree);
};

/**
 * Builds the options passed to the EmberApp constructor.  Most importantly, it
 * disables the autorun and overrides the project to provide a config that is
 * FastBoot compatible.
 */
FastBootBuild.prototype.appOptions = function() {
  return {
    autoRun: false,
    __is_building_fastboot__: true
  };
};

/**
 * Because the FastBoot addon always runs after broccoli-asset-rev,
 * we have to manually apply it to our tree to get asset rewriting
 * functionality.
 */
FastBootBuild.prototype.rewriteAssets = function(tree) {
  var addons = this.parent.addons;

  var broccoliAssetRev = find(addons, function(addon) {
    return addon.name === 'broccoli-asset-rev';
  });

  if (!broccoliAssetRev) { return tree; }

  broccoliAssetRev.options.generateAssetMap = true;
  broccoliAssetRev.options.assetMapPath = 'fastbootAssetMap.json';
  return broccoliAssetRev.postprocessTree('all', tree);
};

module.exports = FastBootBuild;
