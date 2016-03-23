var path = require('path');
var fs = require('fs');
var defaults = require('lodash.defaults');

module.exports = {
  name: 'fastboot:build',
  description: 'Build your assets for FastBoot.',

  availableOptions: [
    { name: 'environment', type: String, default: 'development', aliases: ['e',{'dev' : 'development'}, {'prod' : 'production'}] },
    { name: 'output-path', type: String, default: 'fastboot-dist' }
  ],

  run: function(options) {
    var deprecate = this.project.ui.writeDeprecateLine.bind(this.project.ui);
    var BuildTask = this.tasks.Build;

    var buildTask = new BuildTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    deprecate("Use of ember fastboot:build is deprecated. Please use ember build instead.");

    return buildTask.run(options);
  },
};
