var filterInitializers = require('../broccoli/filter-initializers');
module.exports = {
  /**
   * Filters out initializers and instance initializers that should only run in
   * FastBoot mode.
   */
  treeForApp: function(tree) {
    return filterInitializers(tree, 'server');
  }
};
