'use strict';

const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');
const fixture = require('./helpers/fixture-path');
const FastBoot = require('./../src/index');
const CustomSandbox = require('./fixtures/custom-sandbox/custom-sandbox');

describe("FastBoot", function() {
  it("throws an exception if no distPath is provided", function() {
    var fn = function() {
      return new FastBoot();
    };

    expect(fn).to.throw(/You must instantiate FastBoot with a distPath option/);
  });

  it("throws an exception if no package.json exists in the provided distPath", function() {
    var distPath = fixture('no-package-json');
    var fn = function() {
      return new FastBoot({
        distPath: distPath
      });
    };

    expect(fn).to.throw(/Couldn't find (.+)\/fixtures\/no-package-json/);
  });

  it('throws an error when manifest schema version is higher than fastboot schema version', function() {
    var distPath = fixture('higher-schema-version');
    var fn = function() {
      return new FastBoot({
        distPath: distPath
      });
    };

    expect(fn).to.throw(/An incompatible version between `ember-cli-fastboot` and `fastboot` was found/);
  });

  it("doesn't throw an exception if a package.json is provided", function() {
    var distPath = fixture('empty-package-json');
    var fn = function() {
      return new FastBoot({
        distPath: distPath
      });
    };

    expect(fn).to.throw(/(.+)\/fixtures\/empty-package-json\/package.json was malformed or did not contain a manifest/);
  });

  it("can render HTML", function() {
    var fastboot = new FastBoot({
      distPath: fixture('basic-app')
    });

    return fastboot.visit('/')
      .then(r => r.html())
      .then(html => {
        expect(html).to.match(/Welcome to Ember/);
      });
  });

  it("can render HTML with array of app files defined in package.json", function() {
    var fastboot = new FastBoot({
      distPath: fixture('multiple-app-files')
    });

    return fastboot.visit('/')
      .then(r => r.html())
      .then(html => {
        expect(html).to.match(/Welcome to Ember/);
      });
  });

  it("cannot not render app HTML with shouldRender set as false", function() {
    var fastboot = new FastBoot({
      distPath: fixture('basic-app')
    });

    return fastboot.visit('/', {
      shouldRender: false
    })
      .then(r => r.html())
      .then(html => {
        expect(html).to.not.match(/Welcome to Ember/);
      });
  });

  it("can serialize the head and body", function() {
    var fastboot = new FastBoot({
      distPath: fixture('basic-app')
    });

    return fastboot.visit('/')
      .then((r) => {
        let contents = r.domContents();

        expect(contents.head).to.equal('');
        expect(contents.body).to.match(/Welcome to Ember/);
      });
  });

  it("can forcefully destroy the app instance using destroyAppInstanceInMs", function() {
    var fastboot = new FastBoot({
      distPath: fixture('basic-app')
    });

    return fastboot.visit('/', {
      destroyAppInstanceInMs: 5
    })
      .catch((e) => {
        expect(e.message).to.equal('App instance was forcefully destroyed in 5ms');
      });
  });

  it("can render HTML when sandboxGlobals is provided", function() {
    var fastboot = new FastBoot({
      distPath: fixture('custom-sandbox'),
      sandboxGlobals: {
        foo: 5,
        najax: 'undefined',
        myVar: 'undefined'
      }
    });

    return fastboot.visit('/foo')
      .then(r => r.html())
      .then(html => {
        expect(html).to.match(/foo from sandbox: 5/);
        expect(html).to.match(/najax in sandbox: undefined/);
      });
  });

  it("can render HTML when sandbox class is provided", function() {
    var fastboot = new FastBoot({
      distPath: fixture('custom-sandbox'),
      sandboxClass: CustomSandbox,
      sandboxGlobals: {
        myVar: 2,
        foo: 'undefined',
        najax: 'undefined'
      }
    });

    return fastboot.visit('/foo')
      .then(r => r.html())
      .then(html => {
        expect(html).to.match(/myVar in sandbox: 2/);
      });
  });

  it("rejects the promise if an error occurs", function() {
    var fastboot = new FastBoot({
      distPath: fixture('rejected-promise')
    });

    return expect(fastboot.visit('/')).to.be.rejected;
  });

  it("catches the error if an error occurs", function() {
    var fastboot = new FastBoot({
      distPath: fixture('rejected-promise')
    });

    fastboot.visit('/')
      .catch(function(err) {
        return expect(err).to.be.not.null;
      });
  });

  it("renders an empty page if the resilient flag is set", function() {
    var fastboot = new FastBoot({
      distPath: fixture('rejected-promise'),
      resilient: true
    });

    return fastboot.visit('/')
      .then(r => r.html())
      .then(html => {
        expect(html).to.match(/<body>/);
      });
  });

  it("can reload the distPath", function() {
    var fastboot = new FastBoot({
      distPath: fixture('basic-app')
    });

    return fastboot.visit('/')
      .then(r => r.html())
      .then(html => expect(html).to.match(/Welcome to Ember/))
      .then(hotReloadApp)
      .then(() => fastboot.visit('/'))
      .then(r => r.html())
      .then(html => expect(html).to.match(/Goodbye from Ember/));

    function hotReloadApp() {
      fastboot.reload({
        distPath: fixture('hot-swap-app')
      });
    }
  });

  it("can reload the app using the same sandboxGlobals", function() {
    var fastboot = new FastBoot({
      distPath: fixture('basic-app'),
      sandboxGlobals: {
        foo: 5,
        najax: 'undefined',
        myVar: 'undefined'
      }
    });

    return fastboot.visit('/')
      .then(r => r.html())
      .then(html => expect(html).to.match(/Welcome to Ember/))
      .then(hotReloadApp)
      .then(() => fastboot.visit('/foo'))
      .then(r => r.html())
      .then((html) => {
        expect(html).to.match(/foo from sandbox: 5/);
        expect(html).to.match(/najax in sandbox: undefined/);
      });

    function hotReloadApp() {
      fastboot.reload({
        distPath: fixture('custom-sandbox')
      });
    }
  });

  it("can reload the app using the same sandbox class", function() {
    var fastboot = new FastBoot({
      distPath: fixture('basic-app'),
      sandbox: CustomSandbox,
      sandboxGlobals: {
        myVar: 2,
        foo: 'undefined',
        najax: 'undefined'
      }
    });

    return fastboot.visit('/')
      .then(r => r.html())
      .then(html => expect(html).to.match(/Welcome to Ember/))
      .then(hotReloadApp)
      .then(() => fastboot.visit('/foo'))
      .then(r => r.html())
      .then((html) => {
        expect(html).to.match(/myVar in sandbox: 2/);
      });

    function hotReloadApp() {
      fastboot.reload({
        distPath: fixture('custom-sandbox')
      });
    }
  });

  it("reads the config from package.json", function() {
    var fastboot = new FastBoot({
      distPath: fixture('config-app')
    });

    return fastboot.visit('/')
      .then(r => r.html())
      .then(html => expect(html).to.match(/Config foo: bar/));
  });

  it("prefers APP_CONFIG environment variable", function() {
    var config = {
      modulePrefix: "fastboot-test",
      environment: "development",
      baseURL: "/",
      locationType: "auto",
      EmberENV: { "FEATURES":{} },
      APP: {
        name: "fastboot-test",
        version: "0.0.0+3e9fe92d",
        autoboot: false,
        foo: "baz"
      },
      exportApplicationGlobal:true
    };

    process.env.APP_CONFIG = JSON.stringify(config);

    var fastboot = new FastBoot({
      distPath: fixture('config-app')
    });

    delete process.env.APP_CONFIG;

    return fastboot.visit('/')
      .then(r => r.html())
      .then(html => expect(html).to.match(/Config foo: baz/));
  });

  it("handles apps with config defined in app.js", function() {
    var fastboot = new FastBoot({
      distPath: fixture('config-not-in-meta-app')
    });

    return fastboot.visit('/')
      .then(r => r.html())
      .then(html => expect(html).to.match(/Welcome to Ember/));
  });

  it("reloads the config when package.json changes", function() {
    var distPath = fixture('config-swap-app');
    var packagePath = path.join(distPath, 'package.json');
    var package1Path = path.join(distPath, 'package-1.json');
    var package2Path = path.join(distPath, 'package-2.json');

    copyPackage(package1Path);
    var fastboot = new FastBoot({
      distPath: distPath
    });

    return fastboot.visit('/')
      .then(r => r.html())
      .then(html => expect(html).to.match(/Config foo: bar/))
      .then(() => deletePackage())
      .then(() => copyPackage(package2Path))
      .then(hotReloadApp)
      .then(() => fastboot.visit('/'))
      .then(r => r.html())
      .then(html => expect(html).to.match(/Config foo: boo/))
      .finally(() => deletePackage());

    function hotReloadApp() {
      fastboot.reload({
        distPath: distPath
      });
    }

    function copyPackage(sourcePackage) {
      fs.symlinkSync(sourcePackage, packagePath);
    }

    function deletePackage() {
      fs.unlinkSync(packagePath);
    }
  });

  it("handles apps boot-time failures by throwing Errors", function() {
    var fastboot = new FastBoot({
      distPath: fixture('boot-time-failing-app')
    });

    return fastboot.visit('/')
    .catch((e) => expect(e).to.be.an('error'));
  });

  it("matches app's fastboot-info and result's fastboot-info", function() {
    var fastboot = new FastBoot({
      distPath: fixture('basic-app')
    });

    return fastboot.visit('/')
      .then((r) => {
        let lookupFastboot = r.instance.lookup('info:-fastboot');
        expect(r._fastbootInfo).to.deep.equal(lookupFastboot);
      });
  });

  it("can read multiple configs", function() {
    var fastboot = new FastBoot({
      distPath: fixture('app-with-multiple-config')
    });

    return fastboot.visit('/')
    .then(r => r.html())
    .then(html => {
      expect(html).to.match(/App Name: app-with-multiple-configs/);
      expect(html).to.match(/Other Config {"default":"bar"}/);
    });
  });

});
