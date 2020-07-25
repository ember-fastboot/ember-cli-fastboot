class FakeFastBoot {
  visit() {
    return new Promise(resolve => {
      resolve({
        statusCode: 200,
        headers: {
          entries() {
            return [];
          }
        },
        html() {
          return new Promise(resolve => {
            resolve('foobar');
          });
        }
      })
    });
  }
}

module.exports = function(defaults) {
  var EmberApp = require('ember-cli/lib/broccoli/ember-app');
  var app = new EmberApp(defaults, {
    fastboot: {
      implementation: FakeFastBoot
    }
  });

  return app.toTree();
};
