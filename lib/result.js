'use strict';

const SimpleDOM = require('simple-dom');
const HTMLSerializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);

class Result {
  constructor(instance, html, doc, rootElement) {
    let response = instance.lookup('info:-fastboot').response;

    let head;

    if (doc.head) {
      head = HTMLSerializer.serializeChildren(doc.head);
    }

    this._html = html;
    this.url = instance.getURL();
    this.headers = response.headers;
    this.statusCode = response.statusCode;
    this._contentFor = {
      title: doc.title,
      head: head,
      body: HTMLSerializer.serializeChildren(rootElement)
    };
  }

  html() {
    let html = this._html;
    let contentFor = this._contentFor;

    return insertIntoIndexHTML(html, contentFor.title, contentFor.body, contentFor.head);
  }
}

function insertIntoIndexHTML(html, title, body, head) {
  html = html.replace("<!-- EMBER_CLI_FASTBOOT_BODY -->", body);

  if (title) {
    html = html.replace("<!-- EMBER_CLI_FASTBOOT_TITLE -->", "<title>" + title + "</title>");
  }
  if (head) {
    html = html.replace("<!-- EMBER_CLI_FASTBOOT_HEAD -->", head);
  }

  return html;
}

module.exports = Result;
