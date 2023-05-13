'use strict';

const chalk = require('chalk');
const vm = require('vm');
const sourceMapSupport = require('source-map-support');

const httpRegex = /^https?:\/\//;
const protocolRelativeRegex = /^\/\//;

module.exports = class Sandbox {
  constructor(globals) {
    this.globals = globals;

    let sandbox = this.buildSandbox();
    this.context = vm.createContext(sandbox);
  }

  buildSandbox() {
    let console = this.buildWrappedConsole();
    let fetch = this.buildFetch();
    let URL = require('url');
    let globals = this.globals;

    let sandbox = Object.assign(
      {
        sourceMapSupport,
        console,
        setTimeout,
        clearTimeout,
        URL,

        // Convince jQuery not to assume it's in a browser
        module: { exports: {} },
      },
      fetch,
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

  buildFetch() {
    let globals;

    if (globalThis.fetch) {
      globals = {
        fetch: globalThis.fetch,
        Request: globalThis.Request,
        Response: globalThis.Response,
        Headers: globalThis.Headers,
        AbortController: globalThis.AbortController,
      };
    } else {
      let nodeFetch = require('node-fetch');
      let {
        AbortController,
        abortableFetch,
      } = require('abortcontroller-polyfill/dist/cjs-ponyfill');
      let { fetch, Request } = abortableFetch({
        fetch: nodeFetch,
        Request: nodeFetch.Request,
      });

      globals = {
        fetch,
        Request,
        Response: nodeFetch.Response,
        Headers: nodeFetch.Headers,
        AbortController,
      };
    }

    let originalFetch = globals.fetch;
    globals.fetch = function __fastbootFetch(input, init) {
      input = globals.fetch.__fastbootBuildAbsoluteURL(input);
      return originalFetch(input, init);
    };

    globals.fetch.__fastbootBuildAbsoluteURL = function __fastbootBuildAbsoluteURL(input) {
      if (input && input.href) {
        // WHATWG URL or Node.js Url Object
        input = input.href;
      }

      if (typeof input !== 'string') {
        return input;
      }

      if (protocolRelativeRegex.test(input)) {
        let request = globals.fetch.__fastbootRequest;
        let [protocol] = globals.fetch.__fastbootParseRequest(input, request);
        input = `${protocol}//${input}`;
      } else if (!httpRegex.test(input)) {
        let request = globals.fetch.__fastbootRequest;
        let [protocol, host] = globals.fetch.__fastbootParseRequest(input, request);
        input = `${protocol}//${host}${input}`;
      }

      return input;
    };

    globals.fetch.__fastbootParseRequest = function __fastbootParseRequest(url, request) {
      if (!request) {
        throw new Error(
          `Using fetch with relative URL ${url}, but application instance has not been initialized yet.`
        );
      }

      // Old Prember version is not sending protocol
      const protocol = request.protocol === 'undefined:' ? 'http:' : request.protocol;
      return [protocol, request.host];
    };

    let OriginalRequest = globals.Request;
    globals.Request = class __FastBootRequest extends OriginalRequest {
      constructor(input, init) {
        input = globals.fetch.__fastbootBuildAbsoluteURL(input);
        super(input, init);
      }
    };

    return globals;
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
