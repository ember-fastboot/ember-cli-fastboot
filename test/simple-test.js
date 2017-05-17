'use strict';

const expect = require('chai').expect;
const RSVP = require('rsvp');
const request = RSVP.denodeify(require('request'));

const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

describe('simple acceptance', function() {
  this.timeout(300000);

  describe('with fastboot command', function() {
    let app;

    before(function() {
      app = new AddonTestApp();

      return app.create('dummy')
        .then(function() {
          return app.startServer({
            command: 'fastboot'
          });
        });
    });

    after(function() {
      return app.stopServer();
    });

    it('/ HTML contents', function() {
      return request('http://localhost:49741/')
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
          expect(response.headers["content-type"]).to.eq("text/html; charset=utf-8");
          expect(response.body).to.contain("Welcome to Ember.js");
        });
    });

    it('/posts HTML contents', function() {
      return request('http://localhost:49741/posts')
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
          expect(response.headers["content-type"]).to.eq("text/html; charset=utf-8");
          expect(response.body).to.contain("Welcome to Ember.js");
          expect(response.body).to.contain("Posts Route!");
        });
    });

    it('/not-found HTML contents', function() {
      return request('http://localhost:49741/not-found')
        .then(function(response) {
          expect(response.statusCode).to.equal(404);
          expect(response.headers["content-type"]).to.eq("text/plain; charset=utf-8");
          expect(response.body).to.equal("Not Found");
        });
    });

    it('/boom HTML contents', function() {
      return request('http://localhost:49741/boom')
        .then(function(response) {
          expect(response.statusCode).to.equal(500);
          expect(response.headers["content-type"]).to.eq("text/html; charset=utf-8");
          expect(response.body).to.contain("BOOM");
        });
    });

    it('/assets/vendor.js', function() {
      return request('http://localhost:49741/assets/vendor.js')
        .then(function(response) {
          // Asset serving is off by default
          expect(response.statusCode).to.equal(404);
          expect(response.headers["content-type"]).to.eq("text/plain; charset=utf-8");
          expect(response.body).to.equal("Not Found");
        });
    });
  });

  describe('with serve command', function() {
    let app;

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

    it('/ HTML contents', function() {
      return request({
        url: 'http://localhost:49741/',
        headers: {
          'Accept': 'text/html'
        }
      })
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
          expect(response.headers["content-type"]).to.eq("text/html; charset=utf-8");
          expect(response.body).to.contain("Welcome to Ember.js");
        });
    });

    it('with fastboot query parameter turned on', function() {
      return request({
        url: 'http://localhost:49741/?fastboot=true',
        headers: {
          'Accept': 'text/html'
        }
      })
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
          expect(response.headers["content-type"]).to.eq("text/html; charset=utf-8");
          expect(response.body).to.contain("Welcome to Ember.js");
        });
    });

    it('with fastboot query parameter turned off', function() {
      return request({
        url: 'http://localhost:49741/?fastboot=false',
        headers: {
          'Accept': 'text/html'
        }
      })
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
          expect(response.headers["content-type"]).to.eq("text/html; charset=UTF-8");
          expect(response.body).to.contain("<!-- EMBER_CLI_FASTBOOT_BODY -->");
        });
    });

    it('/posts HTML contents', function() {
      return request({
        url: 'http://localhost:49741/posts',
        headers: {
          'Accept': 'text/html'
        }
      })
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
          expect(response.headers["content-type"]).to.eq("text/html; charset=utf-8");
          expect(response.body).to.contain("Welcome to Ember.js");
          expect(response.body).to.contain("Posts Route!");
        });
    });

    it('/not-found HTML contents', function() {
      return request({
        url: 'http://localhost:49741/not-found',
        headers: {
          'Accept': 'text/html'
        }
      })
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
          expect(response.headers["content-type"]).to.eq("text/html; charset=UTF-8");
          expect(response.body).to.contain("<!-- EMBER_CLI_FASTBOOT_BODY -->");
        });
    });

    it('/boom HTML contents', function() {
      return request({
        url: 'http://localhost:49741/boom',
        headers: {
          'Accept': 'text/html'
        }
      })
        .then(function(response) {
          expect(response.statusCode).to.equal(500);
          expect(response.headers["content-type"]).to.eq("text/html; charset=utf-8");
          expect(response.body).to.contain("BOOM");
        });
    });

    it('/assets/vendor.js', function() {
      return request('http://localhost:49741/assets/vendor.js')
        .then(function(response) {
          // Asset serving is on by default
          expect(response.statusCode).to.equal(200);
          expect(response.headers["content-type"]).to.eq("application/javascript; charset=UTF-8");
          expect(response.body).to.contain("Ember =");
        });
    });
  });
});
