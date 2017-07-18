'use strict';

module.exports = function(environment) {
  var ENV = {
    baseUrl: '/',
    environment: environment,
    modulePrefix: 'fastboot-location-config',
    fastboot: {
      fastbootHeaders: false,
      hostWhitelist: [/localhost:\d+/],
      redirectCode: 302,
    }
  };

  return ENV;
};
