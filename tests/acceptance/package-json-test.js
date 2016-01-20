var chai             = require('chai');
var expect           = chai.expect;
var fs               = require('fs-extra');
var AddonTestApp     = require('ember-cli-addon-tests').AddonTestApp;

chai.use(require('chai-fs'));

describe('generating package.json', function() {
  this.timeout(300000);

  var app;

  before(function() {
    app = new AddonTestApp();

    return app.create('module-whitelist')
      .then(addFastBootDeps);
  });

  describe('with FastBoot builds', function() {

    before(function() {
      return app.run('ember', 'fastboot:build');
    });

    it('builds a package.json', function() {
      expect(app.filePath('fastboot-dist/package.json')).to.be.a.file();
    });

    it("merges FastBoot dependencies from multiple addons", function() {
      var config = fs.readJsonSync(app.filePath('/fastboot-dist/package.json'));

      expect(config.dependencies).to.deep.equal({
        "foo": "1.2.3",
        "bar": "^7.8.9",
        "baz": "0.2.0"
      });
    });
    
    it("contains a whitelist of allowed module names", function() {
      var pkg = fs.readJsonSync(app.filePath('/fastboot-dist/package.json'));

      expect(pkg.fastboot.moduleWhitelist).to.deep.equal([
        'path',
        'foo',
        'bar',
        'baz'
      ]);
    });
    
    it("contains a manifest of FastBoot assets", function() {
      var pkg = fs.readJsonSync(app.filePath('/fastboot-dist/package.json'));
      
      expect(pkg.fastboot.manifest).to.deep.equal({
        appFile: 'assets/module-whitelist.js',
        htmlFile: 'index.html',
        vendorFile: 'assets/vendor.js'
      });
    })

  });

  describe('with browser builds', function() {

    before(function() {
      return app.run('ember', 'build');
    });

    it('does not include a package.json', function() {
      expect(fs.existsSync(app.filePath('dist/package.json'))).to.equal(false);
    });

  });

});

function addFastBootDeps(app) {
  return app.editPackageJSON(function(pkg) {
    pkg['devDependencies']['fake-addon'] = "*";
    pkg['devDependencies']['fake-addon-2'] = "*";
  });
}
