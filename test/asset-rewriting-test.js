var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-fs'));
var AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;
var glob = require('glob');

describe('rewriting HTML', function() {
  this.timeout(400000);

  var app;

  before(function() {
    app = new AddonTestApp();

    return app.create('dummy');
  });

  it("builds an index.html that points to the browser build", function() {
    return app.runEmberCommand('build', '--environment=production')
      .then(function() {
        var appPath = glob.sync(app.filePath('dist/assets/dummy-*.js'))[0];
        var matches = appPath.match(/dist\/assets\/dummy-(.*).js/);
        var appSHA = matches[1];

        expect(app.filePath('dist/index.html')).to.have.content.that.match(new RegExp(appSHA));
      });
  });

});
