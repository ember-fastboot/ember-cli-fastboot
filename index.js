/* jshint node: true */
'use strict';

var path = require('path');
var fs = require('fs-extra');
var existsSync = require('exists-sync');

var EventEmitter = require('events').EventEmitter;
var mergeTrees = require('broccoli-merge-trees');
var VersionChecker = require('ember-cli-version-checker');

var fastbootAppModule = require('./lib/utilities/fastboot-app-module');

var filterInitializers = require('fastboot-filter-initializers');
var FastBootConfig      = require('./lib/broccoli/fastboot-config');

var FASTBOOT_DIR = 'fastboot/app';

/*
 * Main entrypoint for the Ember CLI addon.
 */
module.exports = {
  name: 'ember-cli-fastboot',

  includedCommands: function() {
    return {
      'fastboot':       require('./lib/commands/fastboot')(this),
    };
  },

  // TODO remove this after serve issues are fixed correctly
  init() {
    this._super.init && this._super.init.apply(this, arguments);

    this.emitter = new EventEmitter();
  },

  // TODO remove this after serve issues are fixed correctly
  on: function() {
    this.emitter.on.apply(this.emitter, arguments);
  },

  // TODO remove this after serve issues are fixed correctly
  emit: function() {
    this.emitter.emit.apply(this.emitter, arguments);
  },

  // TODO remove this after serve issues are fixed correctly
  postBuild: function() {
    this.emit('postBuild');
  },

  included: function(app) {
    // set autoRun to false since we will conditionally include creating app when app files
    // is eval'd in app-boot
    app.options.autoRun = false;
    // move fastboot initializers out of app namespace
    // TODO remove this before Fastboot 1.0 GAs
    this.moveFastbootInitializers();
  },

  // Function to move fastboot specific initializers and instance initializers from app/ to fastboot/app
  // Should we move fastboot/[initializers-*]/browser too? It may need a code change of no-op the initializer in fastboot environment
  // should we just throw a deprecation warning for fastboot/[initializers-*]/browser files instead?
  moveFastbootInitializers: function() {
    var deprecate = this.project.ui.writeDeprecateLine.bind(this.project.ui);
    var nodeModulesPath = this.project.nodeModulesPath;
    var fastbootInitializerTypes = [ 'initializers', 'instance-initializers'];
    this.project.addons.forEach(function(addon) {
      var currentAddonPath = path.join(nodeModulesPath, addon.name);

      // check to see if it is a fastboot complaint addon
      var isFastbootAddon = fastbootInitializerTypes.some(function(fastbootInitializerType) {
        var fastbootPath = path.join(currentAddonPath, 'app', fastbootInitializerType, 'fastboot');

        return existsSync(fastbootPath);
      });

      if (isFastbootAddon) {
        deprecate('Having fastboot specific code in app directory of ' + addon.name + ' is deprecated. Please move it to fastboot/app directory.');
        var fastbootDirPath = path.join(currentAddonPath, FASTBOOT_DIR);
        // check if fastboot/app exists
        if(!existsSync(fastbootDirPath)) {
          fs.mkdirsSync(fastbootDirPath);
        }

        // copy over app/initializers/fastboot and app/instance/initializers/fastboot
        fastbootInitializerTypes.forEach(function(fastbootInitializerType) {
          var srcFastbootPath = path.join(currentAddonPath, 'app', fastbootInitializerType, 'fastboot');

          if (existsSync(srcFastbootPath)) {
            var destFastbootPath = path.join(fastbootDirPath, fastbootInitializerType);
            if (!existsSync(destFastbootPath)) {
              fs.mkdirSync(destFastbootPath);
            }

            // fastboot initializer type exists so we need to move this fastboot/app
            var fastbootFiles = fs.readdirSync(srcFastbootPath);
            fastbootFiles.forEach(function(fastbootFile) {
              var srcPath = path.join(srcFastbootPath, fastbootFile);
              var destPath = path.join(destFastbootPath, fastbootFile);
              fs.copySync(srcPath, destPath);

              // delete the original path files so that there are no two initializers with the same name
              fs.unlinkSync(srcPath);
            });
          };
        });
      }
    });
  },

  /**
   * Inserts placeholders into index.html that are used by the FastBoot server
   * to insert the rendered content into the right spot. Also injects a module
   * for FastBoot application boot.
   */
  contentFor: function(type, config, contents) {
    if (type === 'body') {
      return "<!-- EMBER_CLI_FASTBOOT_BODY -->";
    }

    if (type === 'head') {
      return "<!-- EMBER_CLI_FASTBOOT_TITLE --><!-- EMBER_CLI_FASTBOOT_HEAD -->";
    }

    if (type === 'app-boot') {
      return fastbootAppModule(config.modulePrefix, JSON.stringify(config.APP || {}));
    }

    // if the fastboot addon is installed, we overwrite the config-module so that the config can be read
    // from meta tag for browser build and from Fastboot config for fastboot target
    if (type === 'config-module') {
      var emberCliPath = path.join(this.app.project.nodeModulesPath, 'ember-cli');
      contents.splice(0, contents.length);
      contents.push('if (typeof FastBoot !== \'undefined\') {');
      contents.push('return FastBoot.config();');
      contents.push('} else {');
      contents.push('var prefix = \'' + config.modulePrefix + '\';');
      contents.push(fs.readFileSync(path.join(emberCliPath, 'lib/broccoli/app-config-from-meta.js')));
      contents.push('}');
      return;
    }
  },

  // todo replace this with tree for fastboot app
  treeForFastbootApp: function(tree) {
    var trees = [];
    if (tree) {
      trees = [tree];
    }

    if (this._getEmberVersion().lt('2.10.0-alpha.1')) {
      trees.push(this.treeGenerator(path.resolve(this.root, 'app-lt-2-9')));
    }

    return mergeTrees(trees.filter(Boolean), { overwrite: true });
  },

  /**
   * After the entire Broccoli tree has been built for the `dist` directory,
   * adds the `package.json` file to the root.
   */
  postprocessTree: function(type, tree) {
    if (type === 'all') {
      var fastbootConfigTree = this.buildFastbootConfigTree(tree);

      // Merge the package.json with the existing tree
      return mergeTrees([tree, fastbootConfigTree], {overwrite: true});
    }

    return tree;
  },

  buildFastbootConfigTree : function(tree) {
    var env = this.app.env;
    var config = this.project.config(env);
    var fastbootConfig = config.fastboot;
    if (config.hasOwnProperty('APP')) {
      config['APP']['autoboot'] = false;
    } else {
      config['APP'] = {
        'autoboot': false
      };
    }

    return new FastBootConfig(tree, {
      assetMapPath: this.assetMapPath,
      project: this.project,
      name: this.app.name,
      outputPaths: this.app.options.outputPaths,
      ui: this.ui,
      fastbootAppConfig: fastbootConfig,
      appConfig: config
    });
  },

  _getEmberVersion: function() {
    var VersionChecker = require('ember-cli-version-checker');
    var checker = new VersionChecker(this);
    var emberVersionChecker = checker.for('ember', 'bower');

    if (emberVersionChecker.version) {
      return emberVersionChecker;
    }

    return checker.for('ember-source', 'npm');
  }

};
