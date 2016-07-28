var alchemist = require('broccoli-module-alchemist');

module.exports = function() {
  return alchemist({
    targets: ['cjs']
  });
};
