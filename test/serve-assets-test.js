var expect = require('chai').expect;
var RSVP = require('rsvp');
var request = RSVP.denodeify(require('request'));

var AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

describe('serve assets acceptance', function() {
  this.timeout(300000);

  describe('with fastboot command', function() {
    var app;

    before(function() {

      app = new AddonTestApp();

      return app.create('dummy')
        .then(function() {
          return app.startServer({
            command: 'fastboot',
            additionalArguments: ['--serve-assets']
          });
        });
    });

    after(function() {
      return app.stopServer();
    });

    it('/assets/vendor.js', function() {
      return request('http://localhost:49741/assets/vendor.js')
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
          expect(response.headers["content-type"]).to.eq("application/javascript");
          expect(response.body).to.contain("Ember =");
        });
    });

    it('/assets/dummy.js', function() {
      return request('http://localhost:49741/assets/dummy.js')
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
          expect(response.headers["content-type"]).to.eq("application/javascript");
          expect(response.body).to.contain("this.route('posts')");
        });
    });
  });

  describe('with serve command', function() {
    var app;

    before(function() {

      app = new AddonTestApp();

      return app.create('dummy')
        .then(function() {
          return app.startServer({
            command: 'serve'
          });
        });
    });

    after(function() {
      return app.stopServer();
    });

    it('/assets/vendor.js', function() {
      return request('http://localhost:49741/assets/vendor.js')
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
          expect(response.headers["content-type"]).to.eq("application/javascript");
          expect(response.body).to.contain("Ember =");
        });
    });

    it('/assets/dummy.js', function() {
      return request('http://localhost:49741/assets/dummy.js')
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
          expect(response.headers["content-type"]).to.eq("application/javascript");
          expect(response.body).to.contain("this.route('posts')");
        });
    });
  });
});
