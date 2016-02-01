var map = require('broccoli-stew').map;

function patchEmberApp(emberApp) {
  var originalConcatFiles = emberApp.concatFiles;

  emberApp.addonPreconcatTree = addonPreconcatTree;

  emberApp.concatFiles = function(tree, options) {
    if (options.annotation === 'Concat: App') {
      tree = this.addonPreconcatTree(tree);
    }
    return originalConcatFiles.call(this, tree, options);
  };
}

function addonPreconcatTree(tree) {
  var workingTree = tree;

  this.project.addons.forEach(function(addon) {
    if (addon.preconcatTree) {
      workingTree = addon.preconcatTree(workingTree);
    }
  });

  return workingTree;
}

module.exports = patchEmberApp;
