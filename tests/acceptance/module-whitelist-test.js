var chai             = require('chai');
var expect           = chai.expect;
var fs               = require('fs');
var AddonTestApp     = require('ember-cli-addon-tests').AddonTestApp;

chai.use(require('chai-fs'));

describe('module-whitelist', function() {

  this.timeout(300000);

  var app;

  before(function() {
    app = new AddonTestApp();

    return app.create('module-whitelist')
      .then(addFastBootDeps);
  });

  describe('FastBoot builds', function() {

    before(function() {
      return app.run('ember', 'fastboot:build');
    });

    it('builds a fastboot-config.json', function() {
      expect(app.filePath('fastboot-dist/fastboot-config.json')).to.be.a.file();
    });

    it("merges FastBoot dependencies from multiple addons", function() {
      var config = fs.readFileSync(app.filePath('/fastboot-dist/fastboot-config.json'));
      config = JSON.parse(config);

      expect(config.moduleWhitelist).to.deep.equal(['foo', 'bar', 'baz']);
    });

  });

  describe('non-FastBoot builds', function() {

    before(function() {
      return app.run('ember', 'build');
    });

    it('does not include a fastboot-config.json', function() {
      expect(fs.existsSync(app.filePath('fastboot-dist/fastboot-config'))).to.equal(false);
    });

  });

});

function addFastBootDeps(app) {
  return app.editPackageJSON(function(pkg) {
    pkg['devDependencies']['fake-addon'] = "*";
    pkg['devDependencies']['fake-addon-2'] = "*";
  });
}
