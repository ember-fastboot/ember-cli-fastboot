var alchemist = require('broccoli-module-alchemist');

module.exports = function() {
  return alchemist({
    entry: 'fastboot-app-server.js'
  });
};
