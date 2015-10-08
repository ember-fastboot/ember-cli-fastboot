/* jshint node: true */
'use strict';

var Funnel = require('broccoli-funnel');

// Expose the an factory for the creating the `Application` object
// with the proper config at a known path, so that the server does
// not have to disover the app's module prefix ("my-app").
//
// The module defined here is prefixed with a `~` to make it less
// likely to collide with user code, since it is not possible to
// define a module with a name like this in the file system.
function fastbootAppModule(prefix) {
  return [
    "",
    "define('~fastboot/app-factory', ['{{MODULE_PREFIX}}/app', '{{MODULE_PREFIX}}/config/environment'], function(App, config) {",
    "  App = App['default'];",
    "  config = config['default'];",
    "",
    "  return {",
    "    'default': function() {",
    "      return App.create(config.APP);",
    "    }",
    "  };",
    "});",
    ""
  ].join("\n").replace(/\{\{MODULE_PREFIX\}\}/g, prefix);
}

module.exports = {
  name: 'ember-cli-fastboot',

  includedCommands: function() {
    return {
      fastboot: require('./lib/commands/fastboot'),
      'fastboot:build': require('./lib/commands/fastboot-build')
    };
  },

  included: function(app) {
    if (process.env.EMBER_CLI_FASTBOOT) {
      process.env.EMBER_CLI_FASTBOOT_APP_NAME = app.name;
      app.options.autoRun = false;
      app.options.storeConfigInMeta = false;
    }
  },

  config: function(/* environment, appConfig */) {
    // do nothing unless running `ember fastboot` command
    if (!process.env.EMBER_CLI_FASTBOOT) { return {}; }

    return {
      EmberENV: {
        FEATURES: { 'ember-application-visit': true }
      },
      APP: {
        autoboot: false
      }
    };
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
