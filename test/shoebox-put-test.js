var expect = require('chai').expect;
var RSVP = require('rsvp');
var request = RSVP.denodeify(require('request'));

var AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

describe('shoebox - put', function() {
  this.timeout(300000);

  describe('with fastboot command', function() {
    var app;

    before(function() {
      app = new AddonTestApp();

      return app.create('shoebox')
        .then(function() {
          return app.startServer({
            command: 'fastboot'
          });
        });
    });

    after(function() {
      return app.stopServer();
    });

    it('put items into the shoebox', function() {
      return request('http://localhost:49741/')
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
          expect(response.body).to.contain(
            '<script type="fastboot/shoebox" id="shoebox-key1">' +
              '{"foo":"bar"}' +
            '</script>'
          );
          expect(response.body).to.contain(
            '<script type="fastboot/shoebox" id="shoebox-key2">' +
              '{"zip":"zap"}' +
            '</script>'
          );
        });
    });
  });

  describe('with serve command', function() {
    var app;

    before(function() {
      app = new AddonTestApp();

      return app.create('shoebox')
        .then(function() {
          return app.startServer({
            command: 'serve'
          });
        });
    });

    after(function() {
      return app.stopServer();
    });

    it('put items into the shoebox', function() {
      return request({
        url: 'http://localhost:49741/',
        headers: {
          'Accept': 'text/html'
        }
      })
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
          expect(response.body).to.contain(
            '<script type="fastboot/shoebox" id="shoebox-key1">' +
              '{"foo":"bar"}' +
            '</script>'
          );
          expect(response.body).to.contain(
            '<script type="fastboot/shoebox" id="shoebox-key2">' +
              '{"zip":"zap"}' +
            '</script>'
          );
        });
    });
  });
});
