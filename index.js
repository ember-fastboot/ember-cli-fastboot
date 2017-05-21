/* eslint-env node */
'use strict';

const path = require('path');
const fs = require('fs');

const MergeTrees = require('broccoli-merge-trees');
const FastBootExpressMiddleware = require('fastboot-express-middleware');
const FastBoot = require('fastboot');
const chalk = require('chalk');

const fastbootAppModule = require('./lib/utilities/fastboot-app-module');
const FastBootConfig = require('./lib/broccoli/fastboot-config');
const migrateInitializers = require('./lib/build-utilities/migrate-initializers');

const Concat = require('broccoli-concat');
const Funnel = require('broccoli-funnel');
const p = require('ember-cli-preprocess-registry/preprocessors');
const existsSync = require('exists-sync');

/*
 * Main entrypoint for the Ember CLI addon.
 */
module.exports = {
  name: 'ember-cli-fastboot',

  init() {
    this._super.init && this._super.init.apply(this, arguments);
  },

  // TODO remove after few ember-cli-fastboot rc builds
  includedCommands: function() {
    return {
      'fastboot':       require('./lib/commands/fastboot')(this),
    };
  },

  /**
   * Called at the start of the build process to let the addon know it will be
   * used. Sets the auto run on app to be false so that we create and route app
   * automatically only in browser.
   *
   * See: https://ember-cli.com/user-guide/#integration
   */
  included: function(app) {
    // set autoRun to false since we will conditionally include creating app when app files
    // is eval'd in app-boot
    app.options.autoRun = false;
    // get the app registry object and app name so that we can build the fastboot
    // tree
    this._appRegistry = app.registry;
    this._name = app.name;

    // set a environment variable to allow addons to use `fastboot-filter-initializers`
    // for old versions.
    process.env.FASTBOOT_NEW_BUILD = true;

    migrateInitializers(this.project);
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
      const emberCliPath = path.join(this.app.project.nodeModulesPath, 'ember-cli');
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

  treeForFastBoot: function(tree) {
    let fastbootHtmlBarsTree;

    // check the ember-cli version and conditionally patch the DOM api
    if (this._getEmberVersion().lt('2.10.0-alpha.1')) {
      fastbootHtmlBarsTree = this.treeGenerator(path.resolve(__dirname, 'fastboot-app-lt-2-9'));
      return tree ? new MergeTrees([tree, fastbootHtmlBarsTree]) : fastbootHtmlBarsTree;
    }

    return tree;
  },

  /**
   * Function that builds the fastboot tree from all fastboot complaint addons
   * and project and transpiles it into appname-fastboot.js
   */
  _getFastbootTree: function() {
    const appName = this._name;
    const nodeModulesPath = this.project.nodeModulesPath;

    let fastbootTrees = [];
    this.project.addons.forEach((addon) => {
      // walk through each addon and grab its fastboot tree
      const currentAddonFastbootPath = path.join(nodeModulesPath, addon.name, 'fastboot');
      let fastbootTree;
      if (existsSync(currentAddonFastbootPath)) {
        fastbootTree = this.treeGenerator(currentAddonFastbootPath);
        fastbootTrees.push(fastbootTree);
      }

      // invoke addToFastBootTree for every addon
      if (addon.treeForFastBoot) {
        let additionalFastBootTree = addon.treeForFastBoot(fastbootTree);
        if (additionalFastBootTree) {
          fastbootTrees.push(additionalFastBootTree);
        }
      }
    });

    // check the parent containing the fastboot directory
    const projectFastbootPath = path.join(this.project.root, 'fastboot');
    if (existsSync(projectFastbootPath)) {
      let fastbootTree = this.treeGenerator(projectFastbootPath);
      fastbootTrees.push(fastbootTree);
    }

    // transpile the fastboot JS tree
    let mergedFastBootTree = new MergeTrees(fastbootTrees, {
      overwrite: true
    });
    let funneledFastbootTrees = new Funnel(mergedFastBootTree, {
      destDir: appName
    });
    const processExtraTree = p.preprocessJs(funneledFastbootTrees, '/', this._name, {
      registry: this._appRegistry
    });

    let fileAppName = path.basename(this.app.options.outputPaths.app.js).split('.')[0];
    let finalFastbootTree = new Concat(processExtraTree, {
      outputFile: 'assets/' + fileAppName + '-fastboot.js'
    });

    return finalFastbootTree;
  },

  treeForPublic(tree) {
    let fastbootTree = this._getFastbootTree();
    let trees = [];
    if (tree) {
      trees.push(tree);
    }
    trees.push(fastbootTree);

    let newTree = new MergeTrees(trees);

    return newTree;
  },

  /**
   * After the entire Broccoli tree has been built for the `dist` directory,
   * adds the `fastboot-config.json` file to the root.
   *
   */
  postprocessTree: function(type, tree) {
    if (type === 'all') {
      let fastbootConfigTree = this._buildFastbootConfigTree(tree);

      // Merge the package.json with the existing tree
      return new MergeTrees([tree, fastbootConfigTree], {overwrite: true});
    }

    return tree;
  },

  _buildFastbootConfigTree : function(tree) {
    let env = this.app.env;
    let config = this.project.config(env);
    let fastbootConfig = config.fastboot;
    // do not boot the app automatically in fastboot. The instance is booted and
    // lives for the lifetime of the request.
    if ('APP' in config) {
      config['APP']['autoboot'] = false;
    } else {
      config['APP'] = {
        'autoboot': false
      }
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

  serverMiddleware: function(options) {
    let emberCliVersion = this._getEmberCliVersion();
    let app = options.app;

    if (emberCliVersion.gte('2.12.0-beta.1')) {
      // only run the middleware when ember-cli version for app is above 2.12.0-beta.1 since
      // that version contains API to hook fastboot into ember-cli

      app.use((req, resp, next) => {
        const fastbootQueryParam = (req.query.hasOwnProperty('fastboot') && req.query.fastboot === 'false') ? false : true;
        const enableFastBootServe = !process.env.FASTBOOT_DISABLED && fastbootQueryParam;
        const broccoliHeader = req.headers['x-broccoli'];
        const outputPath = broccoliHeader['outputPath'];

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

          let fastbootMiddleware = FastBootExpressMiddleware({
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

  postBuild: function(result) {
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
    const VersionChecker = require('ember-cli-version-checker');
    const checker = new VersionChecker(this);

    return checker.for('ember-cli', 'npm');
  },

  _getEmberVersion: function() {
    const VersionChecker = require('ember-cli-version-checker');
    const checker = new VersionChecker(this);
    const emberVersionChecker = checker.for('ember-source', 'npm');

    if (emberVersionChecker.version) {
      return emberVersionChecker;
    }

    return checker.for('ember', 'bower');
  },
};
