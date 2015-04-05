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
    // When using a dist built html file, we need to reinsert 
    // content-for body so fastboot can insert its content.
    if (type === 'body') {
      return "{{content-for 'body'}}";
    }
  }
};
