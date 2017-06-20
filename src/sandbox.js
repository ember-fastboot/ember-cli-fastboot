'use strict';

const chalk = require('chalk');

class Sandbox {

  constructor(options) {
    this.globals = options.globals;
    this.sandbox = this.buildSandbox();
  }

  buildSandbox() {
    var console = this.buildWrappedConsole();
    var sourceMapSupport = require('./install-source-map-support');
    var URL = require('url');
    var globals = this.globals;

    var sandbox = {
      sourceMapSupport: sourceMapSupport,
      console: console,
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      URL: URL,

      // Convince jQuery not to assume it's in a browser
      module: { exports: {} }
    };

    for (var key in globals) {
      sandbox[key] = globals[key];
    }

    // Set the global as `window`.
    sandbox.window = sandbox;
    sandbox.window.self = sandbox;

    return sandbox;
  }

  buildWrappedConsole() {
    var wrappedConsole =  Object.create(console);
    wrappedConsole.error = function() {
      console.error.apply(console, Array.prototype.map.call(arguments, function(a) {
        return typeof a === 'string' ? chalk.red(a) : a;
      }));
    };

    return wrappedConsole;
  }
}

module.exports = Sandbox;
