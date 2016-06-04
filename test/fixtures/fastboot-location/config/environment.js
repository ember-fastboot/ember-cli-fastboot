'use strict';

module.exports = function(environment) {
  var ENV = {
    baseUrl: '/',
    environment: environment,
    modulePrefix: 'fastboot-location',
    fastboot: {
      fastbootHeaders: true,
      hostWhitelist: [/localhost:\d+/]
    }
  };

  return ENV;
};
