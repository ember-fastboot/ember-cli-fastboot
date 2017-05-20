'use strict';

const SilentError = require('silent-error');

module.exports = function(addon) {
  return {
    name: 'fastboot',
    description: 'Builds and serves your FastBoot app, rebuilding on file changes.',

    availableOptions: [
      { name: 'build', type: Boolean, default: true },
      { name: 'watch', type: Boolean, default: true, aliases: ['w'] },
      { name: 'environment', type: String, default: 'development', aliases: ['e',{'dev' : 'development'}, {'prod' : 'production'}] },
      { name: 'serve-assets', type: Boolean, default: false },
      { name: 'host', type: String, default: '::' },
      { name: 'port', type: Number, default: 3000 },
      { name: 'output-path', type: String, default: 'dist' },
      { name: 'assets-path', type: String, default: 'dist' }
    ],

    run(options) {
      throw new SilentError('the command: `ember fastboot` has been removed, ember serve now supports fastboot.');
    },
  }
};
