'use strict';

module.exports = function (environment) {
  var ENV = {
    rootURL: '/my-root/',
    environment: environment,
    modulePrefix: 'root-url',
    locationType: 'auto',
  };

  return ENV;
};
