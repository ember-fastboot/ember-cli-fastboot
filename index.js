/* jshint node: true */
'use strict';

var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');
var writeFile = require('broccoli-file-creator');
var fastbootAppModule = require('./lib/utilities/fastboot-app-module');
var uniq = require('lodash.uniq');

module.exports = {
  name: 'ember-cli-fastboot',

  includedCommands: function() {
    return {
      'fastboot':         require('./lib/commands/fastboot'),
      'fastboot:build':   require('./lib/commands/fastboot-build')
    };
  },

  included: function(app) {
    if (process.env.EMBER_CLI_FASTBOOT) {
      process.env.EMBER_CLI_FASTBOOT_APP_NAME = app.name;
      app.options.autoRun = false;
      
      // We serve the index.html from fastboot-dist, so this has to apply to both builds
      app.options.storeConfigInMeta = false;
    }
  },

  config: function(/* environment, appConfig */) {
    // do nothing unless running `ember fastboot` command
    if (!process.env.EMBER_CLI_FASTBOOT) { return {}; }

    return {
      APP: {
        autoboot: false
      }
    };
  },

  postprocessTree: function(type, tree) {
    if (type === 'all' && process.env.EMBER_CLI_FASTBOOT) {
      var configTree = this.treeForFastBootConfig();
      tree = mergeTrees([tree, configTree]);
    }

    return tree;
  },

  treeForFastBootConfig: function() {
    var config = this.buildFastBootConfig();
    return writeFile('fastboot-config.json', config);
  },

  buildFastBootConfig: function() {
    var whitelistedModules = [];

    this.eachAddonPackage(function(pkg) {
      var deps = pkg['ember-addon'] && pkg['ember-addon'].fastBootDependencies;

      if (deps) {
        whitelistedModules = whitelistedModules.concat(deps);
      }
    });

    whitelistedModules = uniq(whitelistedModules);

    return JSON.stringify({
      moduleWhitelist: whitelistedModules
    }, null, 2);
  },

  eachAddonPackage: function(cb) {
    this.project.addons.map(function(addon) {
      cb(addon.pkg);
    });
  },

  contentFor: function(type, config) {
    // do nothing unless running `ember fastboot` command
    if (!process.env.EMBER_CLI_FASTBOOT) { return; }

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

  treeForApp: function(tree) {
    if (process.env.EMBER_CLI_FASTBOOT) {
      return new Funnel(tree, {
        annotation: 'Funnel: Remove browser-only initializers',
        exclude: [
          'initializers/browser/*',
          'instance-initializers/browser/*'
        ]
      });
    } else {
      return new Funnel(tree, {
        annotation: 'Funnel: Remove server-only initializers',
        exclude: [
          'initializers/server/*',
          'instance-initializers/server/*'
        ]
      });
    }
  }
};
