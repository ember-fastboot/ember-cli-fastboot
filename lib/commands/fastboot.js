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
    var EmberApp = require('../ember-app');
    var FastBootServer = require('../fastboot-server');
    var RSVP = require('rsvp');

    var emberApp = new EmberApp(appName);
    var server = new FastBootServer({
      app: emberApp,
      port: options.port,
      ui: this.ui
    });

    server.start();

    // Block forever
    return new RSVP.Promise(function() { });
  }
};
