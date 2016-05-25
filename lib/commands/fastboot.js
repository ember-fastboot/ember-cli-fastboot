var RSVP = require('rsvp');
var exec = RSVP.denodeify(require('child_process').exec);

module.exports = {
  name: 'fastboot',
  description: 'Runs a server to render your app using FastBoot.',

  availableOptions: [
    { name: 'build', type: Boolean, default: true },
    { name: 'watch', type: Boolean, default: false, aliases: ['w'] },
    { name: 'environment', type: String, default: 'development', aliases: ['e',{'dev' : 'development'}, {'prod' : 'production'}] },
    { name: 'serve-assets', type: Boolean, default: false },
    { name: 'host', type: String, default: '::' },
    { name: 'port', type: Number, default: 3000 },
    { name: 'output-path', type: String, default: 'dist' },
    { name: 'assets-path', type: String, default: 'dist' }
  ],

  startServer: function(options) {
    var ui = this.ui;
    var self = this;

    if (this._fastBootListener) {
      this._fastBootListener.close();
    }

    ui.writeLine('Installing FastBoot npm dependencies');

    return exec('npm install', { cwd: options.outputPath })
      .then(function() {
        var fastbootMiddleware = require('fastboot-express-middleware');
        var RSVP = require('rsvp');
        var express = require('express');

        var middleware = fastbootMiddleware(options.outputPath);

        var app = express();

        if (options.serveAssets) {
          app.get('/', middleware);
          app.use(express.static(options.assetsPath));
        }

        app.get('/*', middleware);

        app.use(function(req, res) {
          res.sendStatus(404);
        });

        var listener = app.listen(options.port, options.host, function() {
          var host = listener.address().address;
          var port = listener.address().port;
          var family = listener.address().family;

          if (family === 'IPv6') { host = '[' + host + ']'; }

          ui.writeLine('Ember FastBoot running at http://' + host + ":" + port);
          self._fastBootListener = listener;
        });
      });
  },

  triggerBuild: function(options) {
    var BuildTask = this.buildTaskFor(options);
    var buildTask = new BuildTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    return buildTask.run(options);
  },

  buildTaskFor: function(options) {
    if (options.watch) {
      return this.tasks.BuildWatch;
    } else {
      return this.tasks.Build;
    }
  },

  run: function(options) {
    var startServer = function() {
      this.startServer(options);
    }.bind(this);

    var blockForever = function() {
      return new RSVP.Promise(function() { });
    };

    process.on('SIGUSR1', startServer);

    if (options.build) {
      return this.triggerBuild(options)
        .then(startServer)
        .then(blockForever);
    }

    if (options.watch) {
      this.ui.writeWarnLine('The `watch` option is not supported when `build` is disabled.');
    }

    return startServer()
      .then(blockForever);
  }
};
