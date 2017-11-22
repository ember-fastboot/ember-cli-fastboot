'use strict';

const SimpleDOM = require('simple-dom');
const HTMLSerializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);

const SHOEBOX_TAG_PATTERN = '<script type="fastboot/shoebox"';
const HTML_HEAD_REGEX = /^([\s\S]*<\/head>)([\s\S]*)/;

/**
 * Represents the rendered result of visiting an Ember app at a particular URL.
 * A `Result` object is returned from calling {@link FastBoot}'s `visit()`
 * method.
 */
class Result {
  constructor(options) {
    this._instanceDestroyed = false;
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
    let response = this._fastbootInfo.response;
    let statusCode = response && this._fastbootInfo.response.statusCode;

    if (statusCode === 204) {
      this._html = '';
      this._head = '';
      this._body = '';
    } else if (statusCode >= 300 && statusCode <= 399) {
      let location = response.headers.get('location');

      this._html = '<body><!-- EMBER_CLI_FASTBOOT_BODY --></body>';
      this._head = '';
      this._body = '';

      if (location) {
        this._body = `<h1>Redirecting to <a href="${location}">${location}</a></h1>`;
      }
    }

    return insertIntoIndexHTML(this._html, this._head, this._body, this._bodyAttributes);
  }

  /**
   * Returns the HTML representation of the rendered route, inserted
   * into the application's `index.html`, split into chunks.
   * The first chunk contains the document's head, the second contains the body
   * until just before the shoebox tags (if there are any) and the last chunk
   * contains the shoebox tags and the closing `body` tag. If there are no
   * shoebox tags, there are only 2 chunks and the second one contains the
   * complete document body, including the closing `body` tag.
   *
   * @returns {Promise<Array<String>>} the application's DOM serialized to HTML, split into chunks
   */
  chunks() {
    return insertIntoIndexHTML(this._html, this._head, this._body, this._bodyAttributes).then((html) => {
      let [, head, body] = html.match(HTML_HEAD_REGEX);
      let chunks = [head];

      let [plainBody, ...shoeboxes] = body.split(SHOEBOX_TAG_PATTERN);
      chunks.push(plainBody);
      shoeboxes.forEach((shoebox) => {
        chunks.push(`${SHOEBOX_TAG_PATTERN}${shoebox}`);
      });

      return chunks;
    });
  }

  /**
   * Returns the serialized representation of DOM HEAD and DOM BODY
   *
   * @returns {Object} serialized version of DOM
   */
  domContents() {
    return {
      head: this._head,
      body: this._body
    };
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
    if (instance._booted) {
      this.url = instance.getURL();
    }

    let response = this._fastbootInfo.response;

    if (response) {
      this.headers = response.headers;
      this.statusCode = response.statusCode;
    }
  }

  _destroyAppInstance() {
    if (this.instance && !this._instanceDestroyed) {
      this._instanceDestroyed = true;
      this.instance.destroy();
      return true;
    }
    return false;
  }

  _finalizeHTML() {
    let head = this._doc.head;
    let body = this._doc.body;

    if (body.attributes.length > 0) {
      this._bodyAttributes = HTMLSerializer.attributes(body.attributes);
    } else {
      this._bodyAttributes = null;
    }

    if (head) {
      head = HTMLSerializer.serializeChildren(head);
    }

    body = HTMLSerializer.serializeChildren(body);

    this._head = head;
    this._body = body;
  }
}

function missingTag(tag) {
  return Promise.reject(new Error(`Fastboot was not able to find ${tag} in base HTML. It could not replace the contents.`));
}

function insertIntoIndexHTML(html, head, body, bodyAttributes) {
  if (!html) { return Promise.resolve(html); }
  let isBodyReplaced = false;
  let isHeadReplaced = false;

  html = html.replace(/<\!-- EMBER_CLI_FASTBOOT_(HEAD|BODY) -->/g, function(match, tag) {
    if (tag === 'HEAD' && head && !isHeadReplaced) {
      isHeadReplaced = true;
      return head;
    } else if (tag === 'BODY' && body && !isBodyReplaced) {
      isBodyReplaced = true;
      return body;
    }
    return '';
  });

  if (bodyAttributes) {
    html = html.replace(/<body[^>]*/i, function(match) {
      return match + ' ' + bodyAttributes;
    });
  }

  if (head && !isHeadReplaced) {
    return missingTag('<!--EMBER_CLI_FASTBOOT_HEAD-->');
  }
  if (body && !isBodyReplaced) {
    return missingTag('<!--EMBER_CLI_FASTBOOT_BODY-->');
  }

  return Promise.resolve(html);
}

module.exports = Result;
