var Funnel    = require('broccoli-funnel');
var cloneDeep = require('lodash.clonedeep');
var find      = require('lodash.find');

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

  // Set the EMBER_CLI_FASTBOOT environment variable. This serves as a hint
  // for other addons that they should build their trees configured for the
  // FastBoot build.
  //
  // In the future, ideally we can remove this environment variable and there
  // would be a more explicit way to tell addons what the build target is.
  env.EMBER_CLI_FASTBOOT = true;

  var options = this.appOptions();

  var EmberApp = this.app.constructor;
  var emberApp = new EmberApp(options);

  // Ask the Ember app for the Broccoli tree representing its JavaScript
  // assets.
  var fastbootTree = emberApp.javascript();

  // Because this will be merged with the browser build, move the FastBoot
  // build's assets to the fastboot directory.
  fastbootTree = new Funnel(fastbootTree, {
    srcDir: 'assets',
    destDir: 'fastboot'
  });

  delete env.EMBER_CLI_FASTBOOT;

  return this.rewriteAssets(fastbootTree);
};

/**
 * Builds the options passed to the EmberApp constructor.  Most importantly, it
 * disables the autorun and overrides the project to provide a config that is
 * FastBoot compatible.
 */
FastBootBuild.prototype.appOptions = function() {
  var options = cloneDeep(this.app.options);

  options.autoRun = false;
  options.project = this.buildFastBootProject();

  // If plugins get included twice, babel complains about duplicate
  // plugins with the same name and will throw an error that
  // causes the build to fail.
  // We can remove them here and they should hopefully be picked up
  // by `new EmberApp()`. I don't know if this excludes plugins that
  // are included by putting babel options in `ember-cli-build.js`.
  if (options.babel && options.babel.plugins) {
    delete options.babel.plugins;
  }

  return options;
};

/**
 * Because the config information is not read until build time, the
 * EMBER_CLI_FASTBOOT environment variable is not set when the FastBoot
 * build actually happens.
 *
 * To get around this, we give the FastBoot tree a reference to a project
 * that is modified to always return a FastBoot-compatible config.
 */
FastBootBuild.prototype.buildFastBootProject = function() {
  var project = Object.create(this.project);

  project.config = function() {
    var config = Object.getPrototypeOf(this).config.apply(this, arguments);

    config.APP = config.APP || {};
    config.APP.autoboot = false;

    return config;
  };

  return project;
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
