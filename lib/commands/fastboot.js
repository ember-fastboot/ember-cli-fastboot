module.exports = {
  name: 'fastboot',
  description: 'Runs a server to render your app using FastBoot.',

  availableOptions: [
    { name: "build", type: Boolean, default: true },
    { name: 'environment', type: String, default: 'development', aliases: ['e',{'dev' : 'development'}, {'prod' : 'production'}] },
    { name: "port", type: Number, default: 3000 }
  ],

  triggerBuild: function(commandOptions) {
    var BuildTask = this.tasks.Build;
    var buildTask = new BuildTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    commandOptions.environment = commandOptions.environment || 'development';
    commandOptions.outputPath = 'dist';
    return buildTask.run(commandOptions);
  },

  run: function(options, args) {
    var runCommand = function() {
      return this.runCommand(this.project.name(), options);
    }.bind(this);

    if (options.build) {
      return this.triggerBuild(options)
        .then(runCommand);
    }

    return runCommand();
  },

  runCommand: function(appName, options) {
    var RSVP = require('rsvp');

    var port = options.port;

    var emberApp = bootEmberApp(appName);
    startServer(emberApp, port);

    // Block forever
    return new RSVP.Promise(function() { });
  }
};

function startServer(emberApp, port) {
  var express = require('express');
  var app = express();

  app.get("/*", function(req, res) {
    emberApp.waitForBoot().then(function(handleURL) {
      console.log("Handling", req.path);
      handleURL(req.path).then(res.send.bind(res));
    }, function(err) {
      console.log(err);
    });
  });

  var server = app.listen(port, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Ember FastBoot running at http://%s:%s', host, port);
  });
}

function bootEmberApp(appName) {
  var fs = require('fs');

  var sandbox = createSandbox();

  appFile = readAppFile(appName);
  vendorFile = readVendorFile();

  sandbox.sandbox.run(vendorFile.toString());
  sandbox.sandbox.run(appFile.toString());

  return {
    sandbox: sandbox.sandbox,
    waitForBoot: function() {
      return sandbox.promise;
    }
  };
}

function readAppFile(appName) {
  return readFile("app", "dist/assets/" + appName + "*.js");
}

function readVendorFile() {
  return readFile("vendor", "dist/assets/vendor*.js");
}

function readFile(name, globPath) {
  var fs = require('fs');
  var glob = require('glob');

  var files = glob.sync(globPath);

  assert("Found " + files.length + " " + name + " files (expected 1) when globbing '" + globPath + "'.", files.length === 1);

  return fs.readFileSync(files[0]);
}

function createSandbox() {
  var SimpleDOM = require('simple-dom');
  var Contextify = require('contextify');
  var RSVP    = require('rsvp');

  var deferred = RSVP.defer();

  var sandbox = {
    // Expose this so that the FastBoot initializer has access to the fake DOM.
    // We don't expose this as `document` so that other libraries don't mistakenly
    // think they have a full DOM.
    SimpleDOM: SimpleDOM,

    // Expose the console to the FastBoot environment so we can debug
    console: console,

    // setTimeout is an assumed part of JavaScript environments. Expose it.
    setTimeout: setTimeout,

    // Convince jQuery not to assume it's in a browser
    module: { exports: {} },

    // Expose a hook for the Ember app to provide its handleURL functionality
    FastBoot: { resolve: deferred.resolve },

    URL: require("url"),
  };

  // Set the global as `window`.
  sandbox.window = sandbox;

  // The sandbox is now a JavaScript context O_o
  Contextify(sandbox);

  return { sandbox: sandbox, promise: deferred.promise };
}

function assert(message, condition) {
  var SilentError = require('ember-cli/lib/errors/silent');

  if (condition === false) {
    throw new SilentError(message);
  }
}
