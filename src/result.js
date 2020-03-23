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
  constructor(doc, html, fastbootInfo) {
    this.isDestroyed = false;

    this._doc = doc;
    this._html = html;
    this._fastbootInfo = fastbootInfo;
    this.applicationInstance = undefined;
    this.applicationInstanceInstance = undefined;
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

    return insertIntoIndexHTML(
      this._html,
      this._htmlAttributes,
      this._htmlClass,
      this._head,
      this._body,
      this._bodyAttributes,
      this._bodyClass
    );
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
    return insertIntoIndexHTML(
      this._html,
      this._htmlAttributes,
      this._htmlClass,
      this._head,
      this._body,
      this._bodyAttributes,
      this._bodyClass
    ).then(html => {
      let docParts = html.match(HTML_HEAD_REGEX);
      if (!docParts || docParts.length === 1) {
        return [html];
      }

      let [, head, body] = docParts;

      if (!head || !body) {
        throw new Error(
          'Could not idenfity head and body of the document! Make sure the document is well formed.'
        );
      }

      let [plainBody, ...shoeboxes] = body.split(SHOEBOX_TAG_PATTERN);

      let chunks = [head, plainBody].concat(
        shoeboxes.map(shoebox => `${SHOEBOX_TAG_PATTERN}${shoebox}`)
      );

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
      body: this._body,
    };
  }

  /**
   * @private
   *
   * Called once the Result has finished being constructed and the
   * ApplicationInstance instance has finished rendering. Once `finalize()` is
   * called, state is gathered from the completed ApplicationInstance instance
   * and statically copied to this Result instance.
   */
  _finalize() {
    if (this.finalized) {
      throw new Error('Results cannot be finalized more than once');
    }

    // Grab some metadata from the sandboxed application instance
    // and copy it to this Result object.
    let { applicationInstanceInstance } = this;
    if (applicationInstanceInstance) {
      this._finalizeMetadata(applicationInstanceInstance);
    }

    this._finalizeHTML();

    this.finalized = true;
    return this;
  }

  _finalizeMetadata(applicationInstanceInstance) {
    if (applicationInstanceInstance._booted) {
      this.url = applicationInstanceInstance.getURL();
    }

    let { response } = this._fastbootInfo;

    if (response) {
      this.headers = response.headers;
      this.statusCode = response.statusCode;
    }
  }

  _destroy() {
    if (this.isDestroyed) {
      return false;
    }

    this.isDestroyed = true;

    if (this.applicationInstanceInstance !== undefined) {
      this.applicationInstanceInstance.destroy();
    }

    if (this.applicationInstance !== undefined) {
      this.applicationInstance.destroy();
    }

    return true;
  }

  _finalizeHTML() {
    let htmlElement = this._doc.documentElement;
    let head = this._doc.head;
    let body = this._doc.body;

    let { klass: htmlClass, attributes: htmlAttributes } = extractExtraAttributes(htmlElement);
    this._htmlClass = htmlClass;
    this._htmlAttributes = htmlAttributes;

    let { klass: bodyClass, attributes: bodyAttributes } = extractExtraAttributes(body);
    this._bodyClass = bodyClass;
    this._bodyAttributes = bodyAttributes;

    if (head) {
      head = HTMLSerializer.serializeChildren(head);
    }

    body = HTMLSerializer.serializeChildren(body);

    this._head = head;

    // Adding script boundary around the body
    this._body = `<script type="x/boundary" id="fastboot-body-start"></script>${body}<script type="x/boundary" id="fastboot-body-end"></script>`;
  }
}

function extractExtraAttributes(element) {
  let klass;
  let attributes;
  if (element.attributes.length > 0) {
    let elementClass = element.attributes.find(attr => attr.name === 'class');
    if (elementClass) {
      klass = elementClass;
      let otherAttrs = element.attributes.filter(attr => attr.name !== 'class');
      if (otherAttrs.length > 0) {
        attributes = HTMLSerializer.attributes(otherAttrs);
      } else {
        attributes = null;
      }
    } else {
      attributes = HTMLSerializer.attributes(element.attributes);
      klass = null;
    }
  } else {
    klass = attributes = null;
  }
  return { klass, attributes };
}

function missingTag(tag) {
  throw new Error(
    `Fastboot was not able to find ${tag} in base HTML. It could not replace the contents.`
  );
}

async function insertIntoIndexHTML(
  html,
  htmlAttributes,
  htmlClass,
  head,
  body,
  bodyAttributes,
  bodyClass
) {
  if (!html) {
    return Promise.resolve(html);
  }
  let isBodyReplaced = false;
  let isHeadReplaced = false;

  html = html.replace(/<!-- EMBER_CLI_FASTBOOT_(HEAD|BODY) -->/g, function(match, tag) {
    if (tag === 'HEAD' && head && !isHeadReplaced) {
      isHeadReplaced = true;
      return head;
    } else if (tag === 'BODY' && body && !isBodyReplaced) {
      isBodyReplaced = true;
      return body;
    }
    return '';
  });

  if (htmlClass) {
    html = html.replace(/(<html.*)class="([^"]*)"([^>]*)/i, function(_, prefix, klass, suffix) {
      return prefix + `class="${klass + ' ' + htmlClass.value}"` + suffix;
    });
  }
  if (htmlAttributes) {
    html = html.replace(/<html[^>]*/i, function(match) {
      return match + ' ' + htmlAttributes;
    });
  }

  if (bodyClass) {
    html = html.replace(/(<body.*)class="([^"]*)"([^>]*)/i, function(_, prefix, klass, suffix) {
      return prefix + `class="${klass + ' ' + bodyClass.value}"` + suffix;
    });
  }
  if (bodyAttributes) {
    html = html.replace(/<body[^>]*/i, function(match) {
      return match + ' ' + bodyAttributes;
    });
  }

  if (head && !isHeadReplaced) {
    missingTag('<!--EMBER_CLI_FASTBOOT_HEAD-->');
  }
  if (body && !isBodyReplaced) {
    missingTag('<!--EMBER_CLI_FASTBOOT_BODY-->');
  }

  return html;
}

module.exports = Result;
