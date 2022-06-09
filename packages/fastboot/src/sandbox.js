'use strict';

const chalk = require('chalk');
const vm = require('vm');
const sourceMapSupport = require('source-map-support');

module.exports = class Sandbox {
  constructor(globals) {
    this.globals = globals;

    let sandbox = this.buildSandbox();
    this.context = vm.createContext(sandbox);
  }

  buildSandbox() {
    let console = this.buildWrappedConsole();
    let URL = require('url');
    let globals = this.globals;

    const sourceMapConfig = process.setSourceMapsEnabled ? {} : { sourceMapSupport };

    let sandbox = Object.assign(
      {
        sourceMapConfig,
        console,
        setTimeout,
        clearTimeout,
        URL,

        // Convince jQuery not to assume it's in a browser
        module: { exports: {} },
      },
      globals
    );

    // Set the global as `window`.
    sandbox.window = sandbox;
    sandbox.window.self = sandbox;

    return sandbox;
  }

  buildWrappedConsole() {
    let wrappedConsole = Object.create(console);

    wrappedConsole.error = function (...args) {
      console.error.apply(
        console,
        args.map(function (a) {
          return typeof a === 'string' ? chalk.red(a) : a;
        })
      );
    };

    return wrappedConsole;
  }

  runScript(script) {
    script.runInContext(this.context);
  }

  eval(source, filePath) {
    var fileScript = new vm.Script(source, { filename: filePath });
    fileScript.runInContext(this.context);
  }

  run(cb) {
    return cb.call(this.context, this.context);
  }
};
