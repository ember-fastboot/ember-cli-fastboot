/* eslint-env node */
'use strict';

var path = require('path');

var EventEmitter = require('events').EventEmitter;
var mergeTrees = require('broccoli-merge-trees');
var VersionChecker = require('ember-cli-version-checker');
var FastBootExpressMiddleware = require('fastboot-express-middleware');
var FastBoot = require('fastboot');
var chalk = require('chalk');

var patchEmberApp     = require('./lib/ext/patch-ember-app');
var fastbootAppModule = require('./lib/utilities/fastboot-app-module');

var filterInitializers = require('fastboot-filter-initializers');
var FastBootBuild      = require('./lib/broccoli/fastboot-build');

/*
 * Main entrypoint for the Ember CLI addon.
 */

module.exports = {
  name: 'ember-cli-fastboot',

  init() {
    this._super.init && this._super.init.apply(this, arguments);

    this.emitter = new EventEmitter();
  },

  includedCommands: function() {
    return {
      'fastboot':       require('./lib/commands/fastboot')(this),

      /* fastboot:build is deprecated and will be removed in a future version */
      'fastboot:build': require('./lib/commands/fastboot-build')
    };
  },

  on: function() {
    this.emitter.on.apply(this.emitter, arguments);
  },

  emit: function() {
    this.emitter.emit.apply(this.emitter, arguments);
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
  },

  config: function() {
    if (this.app && this.app.options.__is_building_fastboot__) {
      return { APP: { autoboot: false } };
    }
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
      return fastbootAppModule(config.modulePrefix);
    }

    if (type === 'config-module' && this.app.options.__is_building_fastboot__) {
      var linesToRemove = contents.length;
      while(linesToRemove) {
        // Clear out the default config from ember-cli
        contents.pop();
        linesToRemove--;
      }

      return 'return FastBoot.config();';
    }
  },

  treeForApp: function(defaultTree) {
    var trees = [defaultTree];

    if (this._getEmberVersion().lt('2.10.0-alpha.1')) {
      trees.push(this.treeGenerator(path.resolve(this.root, 'app-lt-2-9')));
    }

    return mergeTrees(trees, { overwrite: true });
  },

  /**
   * Filters out initializers and instance initializers that should only run in
   * browser mode.
   */
  preconcatTree: function(tree) {
    return filterInitializers(tree, this.app.name);
  },

  /**
   * After the entire Broccoli tree has been built for the `dist` directory,
   * adds the `fastboot-config.json` file to the root.
   *
   * FASTBOOT_DISABLED is a pre 1.0 power user flag to
   * disable the fastboot build while retaining the fastboot service.
   */
  postprocessTree: function(type, tree) {
    if (type === 'all' && !process.env.FASTBOOT_DISABLED) {
      var fastbootTree = this.buildFastBootTree();

      // Merge the package.json with the existing tree
      return mergeTrees([tree, fastbootTree], {overwrite: true});
    }

    return tree;
  },

  buildFastBootTree: function() {
    var fastbootBuild = new FastBootBuild({
      ui: this.ui,
      assetMapPath: this.assetMapPath,
      project: this.project,
      app: this.app,
      parent: this.parent
    });

    return fastbootBuild.toTree();
  },

  serverMiddleware: function(options) {
    var emberCliVersion = this._getEmberCliVersion();
    var app = options.app;
    var options = options.options;

    if (emberCliVersion.gte('2.12.0-beta.1')) {
      // only run the middleware when ember-cli version for app is above 2.12.0-beta.1 since
      // that version contains API to hook fastboot into ember-cli

      app.use((req, resp, next) => {
        var fastbootQueryParam = (req.query.hasOwnProperty('fastboot') && req.query.fastboot === 'false') ? false : true;
        var enableFastBootServe = !process.env.FASTBOOT_DISABLED && fastbootQueryParam;
        var broccoliHeader = req.headers['x-broccoli'];
        var outputPath = broccoliHeader['outputPath'];

        if (broccoliHeader['url'] === req.serveUrl && enableFastBootServe) {
          // if it is a base page request, then have fastboot serve the base page
          if (!this.fastboot) {
            // TODO(future): make this configurable for allowing apps to pass sandboxGlobals
            // and custom sandbox class
            this.ui.writeLine(chalk.green('App is being served by FastBoot'));
            this.fastboot = new FastBoot({
              distPath: outputPath
            });
          }

          var fastbootMiddleware = FastBootExpressMiddleware({
            fastboot: this.fastboot
          });

          fastbootMiddleware(req, resp, next);
        } else {
          // forward the request to the next middleware (example other assets, proxy etc)
          next();
        }
      });
    }
  },

  outputReady: function() {
    this.emit('outputReady');
  },

  postBuild: function(result) {
    this.emit('postBuild');
    if (this.fastboot) {
      // should we reload fastboot if there are only css changes? Seems it maynot be needed.
      // TODO(future): we can do a smarter reload here by running fs-tree-diff on files loaded
      // in sandbox.
      this.ui.writeLine(chalk.blue('Reloading FastBoot...'));
      this.fastboot.reload({
        distPath: result.directory
      });
    }
  },

  _getEmberCliVersion: function() {
    var VersionChecker = require('ember-cli-version-checker');
    var checker = new VersionChecker(this);

    return checker.for('ember-cli', 'npm');
  },

  _getEmberVersion: function() {
    var VersionChecker = require('ember-cli-version-checker');
    var checker = new VersionChecker(this);
    var emberVersionChecker = checker.for('ember-source', 'npm');

    if (emberVersionChecker.version) {
      return emberVersionChecker;
    }

    return checker.for('ember', 'bower');
  },
};
