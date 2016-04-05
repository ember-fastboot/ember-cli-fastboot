var chalk = require('chalk');

function isLegacyVM() {
  return require('vm').isContext === undefined;
}

function Sandbox(options) {
  var klass;

  if (isLegacyVM()) {
    klass = require('./sandboxes/contextify');
  } else {
    klass = require('./sandboxes/vm');
  }

  return new klass(options);
}

Sandbox.prototype.init = function(options) {
  this.globals = options.globals;
  this.sandbox = this.buildSandbox();
};

Sandbox.prototype.buildSandbox = function() {
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
};

Sandbox.prototype.buildWrappedConsole = function() {
  var wrappedConsole =  Object.create(console);
  wrappedConsole.error = function() {
    console.error.apply(console, Array.prototype.map.call(arguments, function(a) {
      return typeof a === 'string' ? chalk.red(a) : a;
    }));
  };

}

Sandbox.isLegacyVM = isLegacyVM;

module.exports = Sandbox;
