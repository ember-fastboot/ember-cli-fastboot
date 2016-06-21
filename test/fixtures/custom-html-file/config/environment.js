/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'custom-html-file',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',

    fastboot: {
      htmlFile: 'custom-index.html'
    }
  };

  return ENV;
};
