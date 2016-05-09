'use strict';

const SimpleDOM = require('simple-dom');
const HTMLSerializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);

/**
 * Represents the rendered result of visiting an Ember app at a particular URL.
 * A `Result` object is returned from calling {@link FastBoot}'s `visit()`
 * method.
 */
class Result {
  constructor(options) {
    this._doc = options.doc;
    this._html = options.html;
    this._fastbootInfo = options.fastbootInfo;
  }

  /**
   * Returns the HTML representation of the rendered route, inserted
   * into the application's `index.html`.
   *
   * @returns {Promise<String>} the application's DOM serialized to HTML
   */
  html() {
    return Promise.resolve(insertIntoIndexHTML(this._html, this._head, this._body));
  }

  /**
   * @private
   *
   * Called once the Result has finished being constructed and the application
   * instance has finished rendering. Once `finalize()` is called, state is
   * gathered from the completed application instance and statically copied
   * to this Result instance.
   */
  _finalize() {
    if (this.finalized) {
      throw new Error("Results cannot be finalized more than once");
    }

    // Grab some metadata from the sandboxed application instance
    // and copy it to this Result object.
    let instance = this.instance;
    if (instance) {
      this._finalizeMetadata(instance);
    }

    this._finalizeHTML();

    this.finalized = true;
    return this;
  }

  _finalizeMetadata(instance) {
    this.url = instance.getURL();

    let response = this._fastbootInfo.response;

    if (response) {
      this.headers = response.headers;
      this.statusCode = response.statusCode;
    }
  }

  _finalizeHTML() {
    let head = this._doc.head;
    let body = this._doc.body;

    if (head) {
      head = HTMLSerializer.serializeChildren(head);
    }

    body = HTMLSerializer.serializeChildren(body);

    this._head = head;
    this._body = body;
  }
}

function insertIntoIndexHTML(html, head, body) {
  html = html.replace("<!-- EMBER_CLI_FASTBOOT_BODY -->", body);

  if (head) {
    html = html.replace("<!-- EMBER_CLI_FASTBOOT_HEAD -->", head);
  }

  return html;
}

module.exports = Result;
