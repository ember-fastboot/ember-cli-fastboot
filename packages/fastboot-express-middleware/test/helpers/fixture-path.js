var path = require('path');

module.exports = function (fixturePath) {
  return path.join(__dirname, '../fixtures/', fixturePath);
};
