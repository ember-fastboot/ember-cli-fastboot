// Stubs out the `ui` object for printing to the terminal used
// by Ember CLI addons.

module.exports = {
  writeLine: function() {
    console.log.apply(console, arguments);
  }
};

