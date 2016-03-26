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
  this.assetMapPath = this.assetMapPath;
  this.ui = options.ui;
  this.options = options;
  this.project = options.project;
  this.app = options.app;
  this.name = this.app.name;
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
    srcDir: '/',
    include: ['assets/**/*.js', '**/*.json']
  });

  var stew = require('broccoli-stew');

  fastbootTree = stew.mv(fastbootTree, 'assets/assetMap.json', 'fastbootAssetMap.json');
  fastbootTree = stew.mv(fastbootTree, 'assets/*.js', 'fastboot/');

  delete env.EMBER_CLI_FASTBOOT;

  var configTree = this.buildConfigTree(fastbootTree);
  var merge = require('broccoli-merge-trees');

  return merge([fastbootTree, configTree], {overwrite: true});
};

/**
 * Builds the options passed to the EmberApp constructor.  Most importantly, it
 * disables the autorun and overrides the project to provide a config that is
 * FastBoot compatible.
 */
FastBootBuild.prototype.appOptions = function() {
  return {
    project: this.buildFastBootProject(),
    autoRun: false,
    __is_building_fastboot__: true,
  };
};

FastBootBuild.prototype.buildConfigTree = function(tree) {
  var FastBootConfig = require('./fastboot-config');
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

module.exports = FastBootBuild;
