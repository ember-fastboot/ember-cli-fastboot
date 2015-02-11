var fs = require('fs');
var glob = require('glob');

var Contextify = require('contextify');
var SimpleDOM = require('simple-dom');
var RSVP    = require('rsvp');
var chalk = require('chalk');
var najax = require('najax');

function EmberApp(appName) {
  // Promise that represents the completion of app boot.
  var appBoot = RSVP.defer();

  // Create the sandbox, giving it the resolver to resolve once the app
  // has booted.
  var sandbox = createSandbox(appBoot.resolve);

  appFile = readAppFile(appName);
  vendorFile = readVendorFile();

  sandbox.run(vendorFile.toString());
  sandbox.run(appFile.toString());

  this.waitForBoot = function() {
    return appBoot.promise;
  };
}

function createSandbox(appBootResolver) {
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
    FastBoot: { resolve: appBootResolver },

    URL: require("url"),

    najax: najax
  };

  // Set the global as `window`.
  sandbox.window = sandbox;

  // The sandbox is now a JavaScript context O_o
  Contextify(sandbox);

  return sandbox;
}

function assert(message, condition) {
  var SilentError = require('ember-cli/lib/errors/silent');

  if (condition === false) {
    throw new SilentError(message);
  }
}

function readAppFile(appName) {
  return readFile("app", "dist/assets/" + appName + "*.js");
}

function readVendorFile() {
  return readFile("vendor", "dist/assets/vendor*.js");
}

function readFile(name, globPath) {
  var files = glob.sync(globPath);

  assert("Found " + files.length + " " + name + " files (expected 1) when globbing '" + globPath + "'.", files.length === 1);

  return fs.readFileSync(files[0]);
}

module.exports = EmberApp;
