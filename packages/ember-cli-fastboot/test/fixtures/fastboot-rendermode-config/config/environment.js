'use strict';

module.exports = function(environment) {
  var ENV = {
    rootURL: '/',
    locationType: 'auto',
    environment: environment,
    modulePrefix: 'fastboot-rendermode-config',
    fastboot: {
      hostWhitelist: [/localhost:\d+/],
      renderMode: 'serialize',
    }
  };

  return ENV;
};
