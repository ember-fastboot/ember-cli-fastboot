var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-fs'));
var AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;
var glob = require('glob');

describe('rewriting HTML', function() {
  this.timeout(300000);

  var app;

  before(function() {
    app = new AddonTestApp();

    return app.create('dummy');
  });

  it("rewrites index.html to point to browser build", function() {
    return app.runEmberCommand('fastboot:build', '--environment=production')
      .then(function() {
        var appPath = glob.sync(app.filePath('fastboot-dist/browser/assets/dummy-*.js'))[0];
        var matches = appPath.match(/fastboot-dist\/browser\/assets\/dummy-(.*).js/);
        var appSHA = matches[1];

        expect(app.filePath('fastboot-dist/index.html')).to.have.content.that.match(new RegExp(appSHA));
      });
  });
});
