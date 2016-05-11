var expect           = require('chai').expect;
var RSVP             = require('rsvp');
var request          = RSVP.denodeify(require('request'));

var AddonTestApp     = require('ember-cli-addon-tests').AddonTestApp;

describe('head content acceptance', function() {
  this.timeout(300000);

  var app;

  before(function() {
    app = new AddonTestApp();

    return app.create('head-content')
      .then(addDependencies)
      .then(function() {
        return app.startServer({
          command: 'fastboot'
        });
      });
  });

  after(function() {
    return app.stopServer();
  });

  it('/ Has head content replaced', function() {
    return request('http://localhost:49741/')
      .then(function(response) {
        expect(response.statusCode).to.equal(200);
        expect(response.headers["content-type"]).to.eq("text/html; charset=utf-8");
        expect(response.body).to.contain('<meta property="og:title" content="Head Data Title">');
        expect(response.body).to.not.contain('<!-- EMBER_CLI_FASTBOOT_HEAD -->');
      });
  });
});

function addDependencies(app) {
  app.editPackageJSON(function(pkg) {
    pkg['devDependencies']['ember-cli-head'] = "*";
  });
  return app.run('npm', 'install');
}
