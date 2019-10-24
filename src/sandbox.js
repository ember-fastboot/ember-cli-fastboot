'use strict';

const chalk = require('chalk');

class Sandbox {
  constructor(options = {}) {
    this.globals = options.globals;
    this.sandbox = this.buildSandbox();
  }

  buildSandbox() {
    let console = this.buildWrappedConsole();
    let sourceMapSupport = require('./install-source-map-support');
    let URL = require('url');
    let globals = this.globals;

    let sandbox = {
      sourceMapSupport,
      console,
      setTimeout,
      clearTimeout,
      URL,

      // Convince jQuery not to assume it's in a browser
      module: { exports: {} },
    };

    Object.assign(sandbox, globals);

    // Set the global as `window`.
    sandbox.window = sandbox;
    sandbox.window.self = sandbox;

    return sandbox;
  }

  buildWrappedConsole() {
    let wrappedConsole = Object.create(console);

    wrappedConsole.error = function(...args) {
      console.error.apply(
        console,
        args.map(function(a) {
          return typeof a === 'string' ? chalk.red(a) : a;
        })
      );
    };

    return wrappedConsole;
  }
}

module.exports = Sandbox;
