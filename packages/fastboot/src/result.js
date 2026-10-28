import { emptyPage, insertIntoPage } from './html.js';
import { FastBootHeaders } from './info.js';

/**
 * The outcome of `FastBoot#visit()`.
 */
export class Result {
  #rendered;
  #page;

  constructor(rendered, page) {
    this.#rendered = rendered;
    this.#page = page;

    this.statusCode = rendered.statusCode;
    this.routeNames = rendered.routeNames ?? [];
    this.headers = new FastBootHeaders(rendered.headers);
    this.error = rendered.error ? toError(rendered.error) : undefined;
  }

  /**
   * The full HTML page.
   *
   * - a redirect: a short page with a link to the new location
   * - a failed render: the page without rendered content, so that the browser renders it
   */
  html() {
    if (this.statusCode === 204) return '';

    if (this.statusCode >= 300 && this.statusCode < 400) {
      let location = escapeHTML(this.headers.get('location') ?? '');

      return `<!DOCTYPE html>\n<html><body><h1>Redirecting to <a href="${location}">${location}</a></h1></body></html>`;
    }

    if (!this.#rendered.rendered) return emptyPage(this.#page);

    let { head, shoebox } = this.#rendered;

    return insertIntoPage(this.#page, { ...this.#rendered, head: head + shoebox });
  }

  /**
   * The rendered content of `<head>` and `<body>`, without the page around them.
   */
  domContents() {
    return {
      head: this.#rendered.head + this.#rendered.shoebox,
      body: this.#rendered.body,
    };
  }
}

function toError({ name, message, stack }) {
  let error = new Error(message);

  error.name = name;

  if (stack) error.stack = stack;

  return error;
}

function escapeHTML(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
