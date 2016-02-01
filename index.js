/* jshint node: true */
'use strict';

var _ = require('lodash');

var patchEmberApp = require('./lib/ext/patch-ember-app');
var FastBootMode = require('./lib/addon-modes/fastboot');
var BrowserMode  = require('./lib/addon-modes/browser');

var ENV_KEY      = 'EMBER_CLI_FASTBOOT';
var APP_NAME_KEY = 'EMBER_CLI_FASTBOOT_APP_NAME';

/*
 * Main entrypoint for the Ember CLI addon.
 */

module.exports = {
  name: 'ember-cli-fastboot',

  includedCommands: function() {
    return {
      'fastboot':       require('./lib/commands/fastboot'),
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

    var mode;

    if (isFastBoot()) {
      process.env[APP_NAME_KEY] = app.name;
      app.options.autoRun = false;

      mode = FastBootMode;
    } else {
      mode = BrowserMode;
    }

    this.mixin(mode);

    if (mode.included) {
      mode.included.call(this, app);
    }

    // We serve the index.html from fastboot-dist, so this has to apply to both builds
    app.options.storeConfigInMeta = false;
  },

  /**
   * Copies properties of another object into this addon. Used to dynamically add
   * functionality based on which build target we're building for.
   */
  mixin: function(mode) {
    _.extend(this, mode);
  }
};

function isFastBoot() {
  return process.env[ENV_KEY];
}
