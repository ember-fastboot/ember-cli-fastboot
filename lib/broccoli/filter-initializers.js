var Funnel = require('broccoli-funnel');

module.exports = function(tree, mode) {
  return new Funnel(tree, {
    annotation: 'Funnel: Remove ' + mode + '-only initializers',
    exclude: [
      'initializers/' + mode + '/*',
      'instance-initializers/' + mode + '/*'
    ]
  });
};
