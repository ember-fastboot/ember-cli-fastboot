'use strict';

const RSVP = require('rsvp');
const getPort = RSVP.denodeify(require('portfinder').getPort);
const ServerTask = require('../tasks/fastboot-server');
const SilentError = require('silent-error');

const blockForever = () => (new RSVP.Promise(() => {}));
const noop = function() { };

module.exports = {
  name: 'fastboot',
  description: 'Builds and serves your FastBoot app, rebuilding on file changes.',

  availableOptions: [
    { name: 'build', type: Boolean, default: true },
    { name: 'watch', type: Boolean, default: true, aliases: ['w'] },
    { name: 'environment', type: String, default: 'development', aliases: ['e',{'dev' : 'development'}, {'prod' : 'production'}] },
    { name: 'serve-assets', type: Boolean, default: false },
    { name: 'host', type: String, default: '::1' },
    { name: 'port', type: Number, default: 3000 },
    { name: 'output-path', type: String, default: 'dist' },
    { name: 'assets-path', type: String, default: 'dist' }
  ],

  blockForever,
  getPort,
  ServerTask,

  run(options) {
    const runBuild = () => this.runBuild(options);
    const runServer = () => this.runServer(options);
    const blockForever = this.blockForever;

    return this.checkPort(options)
      .then(runServer) // starts on postBuild SIGHUP
      .then(options.build ? runBuild : noop)
      .then(blockForever);
  },

  runServer(options) {
    const ServerTask = this.ServerTask;
    const serverTask = new ServerTask({
      ui: this.ui,
    });
    return serverTask.run(options);
  },

  runBuild(options) {
    const BuildTask = options.watch ? this.tasks.BuildWatch : this.tasks.Build;
    const buildTask = new BuildTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project,
    });
    buildTask.run(options); // no return, BuildWatch.run blocks forever
  },

  checkPort(options) {
    return this.getPort({ port: options.port, host: options.host })
      .then((foundPort) => {
        if (options.port !== foundPort && options.port !== 0) {
          const message = `Port ${options.port} is already in use.`;
          return Promise.reject(new SilentError(message));
        }
        options.port = foundPort;
      });
  },

};
