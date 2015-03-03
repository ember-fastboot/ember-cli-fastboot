module.exports = {
  name: 'fastboot',
  description: 'Runs a server to render your app using FastBoot.',

  availableOptions: [
    { name: 'build', type: Boolean, default: true },
    { name: 'environment', type: String, default: 'development', aliases: ['e',{'dev' : 'development'}, {'prod' : 'production'}] },
    { name: 'port', type: Number, default: 3000 }
  ],

  runCommand: function(appName, options) {
    var FastBootServer = require('../models/server');
    var RSVP = require('rsvp');
    var express = require('express');

    var server = new FastBootServer({
      appFile: findAppFile(appName),
      vendorFile: findVendorFile(),
      htmlFile: findHTMLFile(),
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
};

function findAppFile(appName) {
  return findFile("app", "dist/assets/" + appName + "*.js");
}

function findVendorFile() {
  return findFile("vendor", "dist/assets/vendor*.js");
}

function findHTMLFile() {
  var fs = require('fs');
  if (fs.existsSync('app/fastboot.html')) {
    return 'app/fastboot.html';
  } else if (fs.existsSync('app/index.html')) {
    return 'app/index.html';
  }

  assert("Could not find either app/fastboot.html or app/index.html. Please provide an HTML file to serve FastBoot contents in.", false);
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
