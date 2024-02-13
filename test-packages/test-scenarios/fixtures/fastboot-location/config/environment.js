/* eslint-disable no-undef, prettier/prettier */
'use strict';

module.exports = function(environment) {
  var ENV = {
    rootURL: '/my-root/',
    locationType: 'auto',
    environment: environment,
    modulePrefix: 'classic-app-template',
    fastboot: {
      fastbootHeaders: true,
      hostWhitelist: [/localhost:\d+/]
    }
  };

  return ENV;
};
