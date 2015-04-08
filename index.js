/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-cli-fastboot',

  includedCommands: function() {
    return {
      fastboot: require('./lib/commands/fastboot')
    };
  },

  contentFor: function(type, config) {
    // do nothing unless running `ember fastboot` command
    if (!process.env.EMBER_CLI_FASTBOOT) { return; }

    if (type === 'body') {
      return "<!-- EMBER_CLI_FASTBOOT_BODY -->";
    }
  }
};
