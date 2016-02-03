var Funnel = require('broccoli-funnel');
var path   = require('path');

module.exports = function(tree, mode, appPath) {
  return new Funnel(tree, {
    annotation: 'Funnel: Remove ' + mode + '-only initializers',
    exclude: [
      path.join(appPath, 'initializers/' + mode + '/*'),
      path.join(appPath, 'instance-initializers/' + mode + '/*')
    ]
  });
};
