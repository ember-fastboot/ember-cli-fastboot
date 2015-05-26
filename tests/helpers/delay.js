var RSVP = require('rsvp');

module.exports = function delay(ms) {
  return new RSVP.Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
};
