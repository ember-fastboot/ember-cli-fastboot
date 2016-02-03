var filterInitializers = require('../broccoli/filter-initializers');

module.exports = {
  /**
   * Filters out initializers and instance initializers that should only run in
   * FastBoot mode.
   */
  preconcatTree: function(tree) {
    return filterInitializers(tree, 'fastboot', this.app.name);
  }
};
