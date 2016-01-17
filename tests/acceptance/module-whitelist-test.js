var chai             = require('chai');
var expect           = chai.expect;
var path             = require('path');
var fs               = require('fs');
var runCommand       = require('ember-cli/tests/helpers/run-command');
var emberCommand     = path.join('.', 'node_modules', 'ember-cli', 'bin', 'ember');

var acceptance       = require('../helpers/acceptance');
var createApp        = acceptance.createApp;
var copyFixtureFiles = acceptance.copyFixtureFiles;

chai.use(require('chai-fs'));

var appName = 'module-whitelist';

describe('module-whitelist', function() {
  this.timeout(300000);

  describe('FastBoot builds', function() {

    before(function() {
      return createApp(appName)
        .then(function() {
          return copyFixtureFiles(appName);
        })
        .then(addFastBootDeps)
        .then(buildApp(true))
        .catch(function(e) {
          console.log(e.stack);
        });
    });

    it('builds a fastboot-config.json', function() {
      expect('fastboot-dist/fastboot-config.json').to.be.a.file();
    });

    it("merges FastBoot dependencies from multiple addons", function() {
      var config = fs.readFileSync('fastboot-dist/fastboot-config.json');
      config = JSON.parse(config);

      expect(config.moduleWhitelist).to.deep.equal(['foo', 'bar', 'baz']);
    });

  });

  describe('non-FastBoot builds', function() {
    before(function() {
      return createApp(appName)
        .then(function() {
          return copyFixtureFiles(appName);
        })
        .then(addFastBootDeps)
        .then(buildApp())
        .catch(function(e) {
          console.log(e.stack);
        });
    });

    it('does not include a fastboot-config.json', function() {
      expect(fs.existsSync('fastboot-dist/fastboot-config')).to.equal(false);
    });
  });

});

function addFastBootDeps() {
  var pkg = JSON.parse(fs.readFileSync('package.json'));
  pkg['devDependencies']['fake-addon'] = "*";
  pkg['devDependencies']['fake-addon-2'] = "*";
  fs.writeFileSync('package.json', JSON.stringify(pkg));
}

function buildApp(fastBoot) {
  return function() {
    var args = [
      emberCommand,
      fastBoot ? 'fastboot:build' : 'build'
    ];

    var commandOptions = {
      verbose: true,

      onOutput: function() { }
    };

    args.push(commandOptions);

    return runCommand.apply(null, args);
  };
}
