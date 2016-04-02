/*jshint node:true*/
module.exports = {
  description: 'Installation blueprint for ember-cli-fastboot',
  normalizeEntityName: function() {
    // this prevents an error when the entityName is
    // not specified (since that doesn't actually matter
    // to us
  }
};
