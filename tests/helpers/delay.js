var RSVP = require('rsvp');
var Promise = RSVP.Promise;

module.exports = function delay(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
};
