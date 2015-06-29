var fs = require('fs');

var Contextify = require('contextify');
var SimpleDOM = require('simple-dom');
var RSVP    = require('rsvp');
var chalk = require('chalk');
var najax = require('najax');
var debug   = require('debug')('ember-cli-fastboot:ember-app');
var emberDebug = require('debug')('ember-cli-fastboot:ember');

function EmberApp(options) {
  this.appFile = options.appFile;
  this.vendorFile = options.vendorFile;

  debug("app created; app=%s; vendor=%s", this.appFile, this.vendorFile);

  // Promise that represents the completion of app boot.
  var appBoot = RSVP.defer();

  // Create the sandbox, giving it the resolver to resolve once the app
  // has booted.
  var sandbox = createSandbox(appBoot.resolve, {
    najax: najax
  });

  appFile = fs.readFileSync(this.appFile, 'utf8');
  vendorFile = fs.readFileSync(this.vendorFile, 'utf8');

  sandbox.run(vendorFile);
  debug("vendor file evaluated");

  sandbox.run(appFile);
  debug("app file evaluated");

  this.waitForBoot = function() {
    return appBoot.promise;
  };

  this.waitForBoot().then(function() {
    debug("app booted");
  });
}

function createSandbox(appBootResolver, dependencies) {
  var wrappedConsole =  Object.create(console);
  wrappedConsole.error = function() {
    console.error.apply(console, Array.prototype.map.call(arguments, function(a) {
      return typeof a === 'string' ? chalk.red(a) : a;
    }));
  };

  var sandbox = {
    // Expose this so that the FastBoot initializer has access to the fake DOM.
    // We don't expose this as `document` so that other libraries don't mistakenly
    // think they have a full DOM.
    SimpleDOM: SimpleDOM,

    // Expose the console to the FastBoot environment so we can debug
    console: wrappedConsole,

    // setTimeout is an assumed part of JavaScript environments. Expose it.
    setTimeout: setTimeout,

    // Convince jQuery not to assume it's in a browser
    module: { exports: {} },

    // Expose a hook for the Ember app to provide its handleURL functionality
    FastBoot: {
      resolve: appBootResolver,
      debug: emberDebug
    },

    URL: require("url")
  };

  for (var dep in dependencies) {
    sandbox[dep] = dependencies[dep];
  }

  // Set the global as `window`.
  sandbox.window = sandbox;
  sandbox.window.self = sandbox;

  // The sandbox is now a JavaScript context O_o
  Contextify(sandbox);

  return sandbox;
}

module.exports = EmberApp;
