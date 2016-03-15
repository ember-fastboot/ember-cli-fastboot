var BuildTask = require('ember-cli/lib/tasks/build');

module.exports = BuildTask.extend({
  run: function(options) {
    process.env.EMBER_CLI_FASTBOOT = true;

    return this._super.run.apply(this, arguments)
      .finally(function() {
        delete process.env.EMBER_CLI_FASTBOOT;
      });
  }
});
