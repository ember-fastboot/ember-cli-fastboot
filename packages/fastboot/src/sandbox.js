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

    let sandbox = Object.assign(
      {
        sourceMapSupport,
        console,
        fetch,
        document,
        navigator,
        setTimeout,
        clearTimeout,
        URL,

        // Convince jQuery not to assume it's in a browser
        module: { exports: {} },

        MutationObserver,
        ResizeObserver,
        AbortController,
        ReadableStream:
            typeof ReadableStream !== 'undefined'
                ? ReadableStream
                : require('node:stream/web').ReadableStream,
        WritableStream:
            typeof WritableStream !== 'undefined'
                ? WritableStream
                : require('node:stream/web').WritableStream,
        TransformStream:
            typeof TransformStream !== 'undefined'
                ? TransformStream
                : require('node:stream/web').TransformStream,
        Headers: typeof Headers !== 'undefined' ? Headers : undefined,
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
