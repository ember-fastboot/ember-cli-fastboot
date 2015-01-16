module.exports = {
  name: 'fastboot',
  description: 'Runs a server to render your app using FastBoot.',

  availableOptions: [
    { name: "build", type: Boolean, default: true }
  ],

  anonymousOptions: [
    '<app-js-path>',
    '<vendor-js-path>'
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

  runCommand: function(rawArgs) {
    var fs = require('fs');

    var appFile = rawArgs[0];
    var vendorFile = rawArgs[1];

    appFile = fs.readFileSync(appFile);
    vendorFile = fs.readFileSync(vendorFile);

    var sandbox = createSandbox();

    sandbox.sandbox.run(vendorFile.toString());
    sandbox.sandbox.run(appFile.toString());

    var express = require('express');
    var app = express();

    app.get("/*", function(req, res) {
      sandbox.promise.then(function(handleURL) {
        console.log("Handling", req.path);
        handleURL(req.path).then(res.send.bind(res));
      }, function(err) {
        console.log(err);
      });
    });

    var server = app.listen(3000, function() {
      var host = server.address().address;
      var port = server.address().port;

      console.log('Ember FastBoot running at http://%s:%s', host, port);
    });

    var RSVP    = require('rsvp');
    var Promise = RSVP.Promise;

    // Block forever
    return new Promise(function() { });
  },

  run: function(options, rawArgs) {
    var self = this;

    if (options.build) {
      return this.triggerBuild(options)
        .then(function() {
          return self.runCommand(rawArgs);
        });
    }

    return self.runCommand(rawArgs);
  }
};

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
    FastBoot: { resolve: deferred.resolve }
  };

  // Set the global as `window`.
  sandbox.window = sandbox;

  // The sandbox is now a JavaScript context O_o
  Contextify(sandbox);

  return { sandbox: sandbox, promise: deferred.promise };
}
