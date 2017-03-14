var expect = require('chai').expect;
var Result = require('./../src/result.js');
var FastBootInfo = require('./../src/fastboot-info.js');
var SimpleDOM = require('simple-dom');

describe('Result', function() {
  var doc, result, html;

  beforeEach(function () {
    var req = { headers: {}, get() {} };

    doc = new SimpleDOM.Document();
    html = `<!-- EMBER_CLI_FASTBOOT_HEAD -->
            <!-- EMBER_CLI_FASTBOOT_BODY -->`;

    result = new Result({
      doc: doc,
      html: html,
      fastbootInfo: new FastBootInfo(req, {}, [ 'example.com' ])
    });
  });

  it('constructor', function () {
    expect(result).to.be.an.instanceOf(Result);
    expect(result._doc).to.be.an.instanceOf(SimpleDOM.Document);
    expect(result._html).to.be.a('string');
    expect(result._fastbootInfo).to.be.an.instanceOf(FastBootInfo);
  });

  describe('html()', function () {

    describe('when the response status code is 204', function () {
      beforeEach(function () {
        result._fastbootInfo.response.statusCode = 204;
        result._finalize();
      });

      it('should return an empty message body', function () {
        return result.html()
        .then(function (result) {
          expect(result).to.equal('');
        });
      });
    });

    describe('when the response status code is 3XX', function () {
      beforeEach(function () {
        result._fastbootInfo.response.headers.set('location', 'http://some.example.com/page');
        result._fastbootInfo.response.statusCode = 307;
        result._finalize();
      });

      it('should return a document body with redirect information', function () {
        return result.html()
        .then(function (result) {
          expect(result).to.include('<body>');
          expect(result).to.include('Redirecting to');
          expect(result).to.include('http://some.example.com/page');
          expect(result).to.include('</body>');
        });
      });
    });

    describe('when the response status code is not 3XX or 204', function () {
      var HEAD = '<meta name="foo" content="bar">';
      var BODY = '<h1>A normal response document</h1>';

      beforeEach(function () {
        doc.head.appendChild(doc.createRawHTMLSection(HEAD));
        doc.body.appendChild(doc.createRawHTMLSection(BODY));

        result._fastbootInfo.response.statusCode = 418;
        result._finalize();
      });

      it('should return the FastBoot-rendered document body', function () {
        return result.html()
        .then(function (result) {
          expect(result).to.include(HEAD);
          expect(result).to.include(BODY);
        });
      });
    });

    describe('when the document has special-case content', function () {
      var BODY = '<h1>A special response document: $$</h1>';

      beforeEach(function () {
        doc.body.appendChild(doc.createRawHTMLSection(BODY));

        result._fastbootInfo.response.statusCode = 418;
        result._finalize();
      });

      it('it should handle \'$$\' correctly (due to `String.replace()` gotcha)', function () {
        return result.html()
        .then(function (result) {
          expect(result).to.include(BODY);
        });
      });
    });
  });
});
