var path = require('path');

module.exports = {
  name: 'fastboot:build',
  description: 'Build your assets for FastBoot.',

  availableOptions: [
    { name: 'environment', type: String, default: 'development', aliases: ['e',{'dev' : 'development'}, {'prod' : 'production'}] },
    { name: 'output-path', type: String, default: 'fastboot-dist' }
  ],

  run: function(options, args) {
    process.env.EMBER_CLI_FASTBOOT = true;

    var BuildTask = this.tasks.Build;
    var buildTask = new BuildTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    return buildTask.run(options);
  },
};
