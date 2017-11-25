'use strict';

const expect = require('chai').expect;
const RSVP = require('rsvp');
const request = RSVP.denodeify(require('request'));

const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

describe('module unification', function() {
  this.timeout(400000);

  let app;

  before(function() {
    app = new AddonTestApp();

    return app.create('module-unification')
      .then(() => app.editPackageJSON(pkg => {
        pkg['devDependencies']["ember-cli"] = "^2.16.0-beta.2";
      }))
      .then(() => app.run('npm', 'install'))
      .then(() => app.startServer({
        command: 'serve'
      }));
  });

  after(function() {
    return app.stopServer();
  });

  it('uses module unification', function() {
    return request({
      url: 'http://localhost:49741/',
      headers: {
        'Accept': 'text/html'
      }
    })
      .then(function(response) {
        expect(response.statusCode).to.equal(200);
        expect(response.headers["content-type"]).to.eq("text/html; charset=utf-8");

        expect(response.body).to.contain("<title>ModuleUnification</title>");
        expect(response.body).to.contain("<h1>application template</h1>");
      });
  });
});

function useBetaEmber(app) {
  return app.editPackageJSON(pkg => {
    pkg['devDependencies']["ember-cli"] = "^2.16.0-beta.2";
  });
}