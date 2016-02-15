var RSVP = require('rsvp');
var exec = RSVP.denodeify(require('child_process').exec);

module.exports = {
  name: 'fastboot',
  description: 'Runs a server to render your app using FastBoot.',

  availableOptions: [
    { name: 'build', type: Boolean, default: true },
    { name: 'environment', type: String, default: 'development', aliases: ['e',{'dev' : 'development'}, {'prod' : 'production'}] },
    { name: 'serve-assets', type: Boolean, default: false },
    { name: 'host', type: String, default: '::' },
    { name: 'port', type: Number, default: 3000 },
    { name: 'output-path', type: String, default: 'fastboot-dist' },
    { name: 'assets-path', type: String, default: 'dist' }
  ],

  runCommand: function(appName, options) {
    var commandOptions = this.commandOptions;
    var outputPath = commandOptions.outputPath;
    var assetsPath = commandOptions.assetsPath;
    var ui = this.ui;

    ui.writeLine("Installing FastBoot npm dependencies");

    return exec('npm install', { cwd: outputPath })
      .then(function() {
        var FastBootServer = require('ember-fastboot-server');
        var RSVP = require('rsvp');
        var express = require('express');
        var cookieParser = require('cookie-parser')

        var server = new FastBootServer({
          distPath: outputPath,
          ui: ui
        });

        var app = express();

        app.use(cookieParser());

        if (commandOptions.serveAssets) {
          app.get('/', server.middleware());
          app.use(express.static(assetsPath));
        }

        app.get('/*', server.middleware());

        var listener = app.listen(options.port, options.host, function() {
          var host = listener.address().address;
          var port = listener.address().port;
          var family = listener.address().family;

          if (family === 'IPv6') { host = '[' + host + ']'; }

          ui.writeLine('Ember FastBoot running at http://' + host + ":" + port);
        });

        // Block forever
        return new RSVP.Promise(function() { });
      });
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
      var appName = process.env.EMBER_CLI_FASTBOOT_APP_NAME || this.project.name();

      return this.runCommand(appName, options);
    }.bind(this);

    if (options.build) {
      return this.triggerBuild(options)
        .then(runCommand);
    }

    return runCommand();
  }
};
