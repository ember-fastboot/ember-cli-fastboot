'use strict';

module.exports = function(environment) {
  var ENV = {
    rootURL: '/my-root/',
    locationType: 'auto',
    environment: environment,
    modulePrefix: 'fastboot-location',
    fastboot: {
      fastbootHeaders: true,
      hostWhitelist: [/localhost:\d+/]
    }
  };

  return ENV;
};
