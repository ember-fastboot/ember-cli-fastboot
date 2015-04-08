var path = require('path');

module.exports = {
  name: 'fastboot',
  description: 'Runs a server to render your app using FastBoot.',

  availableOptions: [
    { name: 'build', type: Boolean, default: true },
    { name: 'environment', type: String, default: 'development', aliases: ['e',{'dev' : 'development'}, {'prod' : 'production'}] },
    { name: 'port', type: Number, default: 3000 },
    { name: 'output-path', type: String, default: 'fastboot-dist' }
  ],

  runCommand: function(appName, options) {
    var FastBootServer = require('../models/server');
    var RSVP = require('rsvp');
    var express = require('express');
    var outputPath = this.commandOptions.outputPath;

    var server = new FastBootServer({
      appFile: findAppFile(outputPath, appName),
      vendorFile: findVendorFile(outputPath),
      htmlFile: findHTMLFile(outputPath),
      ui: this.ui
    });

    var app = express();
    app.get('/*', server.middleware());

    var ui = this.ui;

    var listener = app.listen(options.port, function() {
      var host = listener.address().address;
      var port = listener.address().port;

      ui.writeLine('Ember FastBoot running at http://' + host + ":" + port);
    });

    // Block forever
    return new RSVP.Promise(function() { });
  },

  triggerBuild: function(commandOptions) {
    var BuildTask = this.tasks.Build;
    var buildTask = new BuildTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    return buildTask.run(commandOptions);
  },

  run: function(options, args) {
    process.env.EMBER_CLI_FASTBOOT = true;

    this.commandOptions = options;

    var runCommand = function() {
      return this.runCommand(this.project.name(), options);
    }.bind(this);

    if (options.build) {
      return this.triggerBuild(options)
        .then(runCommand);
    }

    return runCommand();
  },
};

function findAppFile(outputPath, appName) {
  return findFile("app", path.join(outputPath, "assets", appName + "*.js"));
}

function findVendorFile(outputPath) {
  return findFile("vendor", path.join(outputPath, "assets", "vendor*.js"));
}

function findHTMLFile(outputPath) {
  var fs = require('fs');
  if (fs.existsSync('app/fastboot.html')) {
    return 'app/fastboot.html';
  }

  return findFile('html', path.join(outputPath, 'index*.html'));
}

function findFile(name, globPath) {
  var glob = require('glob');
  var files = glob.sync(globPath);

  assert("Found " + files.length + " " + name + " files (expected 1) when globbing '" + globPath + "'.", files.length === 1);

  return files[0];
}

function assert(message, condition) {
  var SilentError = require('ember-cli/lib/errors/silent');

  if (condition === false) {
    throw new SilentError(message);
  }
}
