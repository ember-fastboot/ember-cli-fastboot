'use strict';

const expect = require('chai').expect;
const fixture = require('./helpers/fixture-path');
const FastBoot = require('./../src/index');

describe('FastBootShoebox', function () {
  it('can render the escaped shoebox HTML', function () {
    var fastboot = new FastBoot({
      distPath: fixture('shoebox'),
    });

    return fastboot
      .visit('/')
      .then((r) => r.html())
      .then((html) => {
        expect(html).to.match(
          /<script type="fastboot\/shoebox" id="shoebox-key1">{"foo":"bar"}<\/script>/
        );
        expect(html).to.match(
          /<script type="fastboot\/shoebox" id="shoebox-key2">{"zip":"zap"}<\/script>/
        );

        // Special characters are JSON encoded, most notably the </script sequence.
        expect(html).to.include(
          '<script type="fastboot/shoebox" id="shoebox-key4">{"nastyScriptCase":"\\u003cscript\\u003ealert(\'owned\');\\u003c/script\\u003e\\u003c/script\\u003e\\u003c/script\\u003e"}</script>'
        );

        expect(html).to.include(
          '<script type="fastboot/shoebox" id="shoebox-key5">{"otherUnicodeChars":"\\u0026\\u0026\\u003e\\u003e\\u003c\\u003c\\u2028\\u2028\\u2029\\u2029"}</script>'
        );
      });
  });

  it('can render the escaped shoebox HTML with shouldRender set to false', function () {
    var fastboot = new FastBoot({
      distPath: fixture('shoebox'),
    });

    return fastboot
      .visit('/', {
        shouldRender: false,
      })
      .then((r) => r.html())
      .then((html) => {
        expect(html).to.match(
          /<script type="fastboot\/shoebox" id="shoebox-key1">{"foo":"bar"}<\/script>/
        );
        expect(html).to.match(
          /<script type="fastboot\/shoebox" id="shoebox-key2">{"zip":"zap"}<\/script>/
        );

        // Special characters are JSON encoded, most notably the </script sequence.
        expect(html).to.include(
          '<script type="fastboot/shoebox" id="shoebox-key4">{"nastyScriptCase":"\\u003cscript\\u003ealert(\'owned\');\\u003c/script\\u003e\\u003c/script\\u003e\\u003c/script\\u003e"}</script>'
        );

        expect(html).to.include(
          '<script type="fastboot/shoebox" id="shoebox-key5">{"otherUnicodeChars":"\\u0026\\u0026\\u003e\\u003e\\u003c\\u003c\\u2028\\u2028\\u2029\\u2029"}</script>'
        );
      });
  });

  it('cannot render the escaped shoebox HTML when disableShoebox is set to true', function () {
    var fastboot = new FastBoot({
      distPath: fixture('shoebox'),
    });

    return fastboot
      .visit('/', {
        disableShoebox: true,
      })
      .then((r) => r.html())
      .then((html) => {
        expect(html).to.not.match(
          /<script type="fastboot\/shoebox" id="shoebox-key1">{"foo":"bar"}<\/script>/
        );
        expect(html).to.not.match(
          /<script type="fastboot\/shoebox" id="shoebox-key2">{"zip":"zap"}<\/script>/
        );

        // Special characters are JSON encoded, most notably the </script sequence.
        expect(html).to.not.include(
          '<script type="fastboot/shoebox" id="shoebox-key4">{"nastyScriptCase":"\\u003cscript\\u003ealert(\'owned\');\\u003c/script\\u003e\\u003c/script\\u003e\\u003c/script\\u003e"}</script>'
        );

        expect(html).to.not.include(
          '<script type="fastboot/shoebox" id="shoebox-key5">{"otherUnicodeChars":"\\u0026\\u0026\\u003e\\u003e\\u003c\\u003c\\u2028\\u2028\\u2029\\u2029"}</script>'
        );
      });
  });
});
