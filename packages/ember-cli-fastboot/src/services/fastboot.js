import { assert } from '@ember/debug';
import { getOwner } from '@ember/owner';
import Service from '@ember/service';

/**
 * Data that the server gave to this render.
 * Exists only during a FastBoot render.
 */
function infoOf(service) {
  return getOwner(service).lookup('info:-fastboot');
}

class Shoebox {
  #service;
  #cache = new Map();

  constructor(service) {
    this.#service = service;
  }

  /**
   * Sends a value with the rendered page.
   * In a browser, this does nothing.
   */
  put(key, value) {
    assert('the shoebox key must be a string', typeof key === 'string');

    let info = infoOf(this.#service);

    if (info) info.shoebox[key] = value;
  }

  retrieve(key) {
    let info = infoOf(this.#service);

    if (info) return info.shoebox[key];

    if (this.#cache.has(key)) return this.#cache.get(key);

    let text = document.getElementById(`shoebox-${key}`)?.textContent;

    if (!text) return undefined;

    let value = JSON.parse(text);

    this.#cache.set(key, value);

    return value;
  }
}

/**
 * Request and response data of a FastBoot render.
 *
 * During a FastBoot render, the app runs with a DOM and a `document`,
 * the same as in a browser.
 * Most apps do not need this service.
 */
export default class FastBootService extends Service {
  shoebox = new Shoebox(this);
  #browserResponse;

  /**
   * True during a FastBoot render.
   *
   * Do not use it to skip code on the server.
   * The server has a DOM, so code that works in a browser works there too.
   */
  get isFastBoot() {
    return infoOf(this) !== undefined;
  }

  get request() {
    return infoOf(this)?.request ?? null;
  }

  /**
   * The status code and headers of the HTTP response.
   * In a browser, changes to it do nothing.
   */
  get response() {
    return infoOf(this)?.response ?? (this.#browserResponse ??= { statusCode: 200, headers: new Headers() });
  }

  get metadata() {
    return infoOf(this)?.metadata;
  }

  /**
   * The server waits for the promise before it sends the page.
   * In a browser, this does nothing.
   */
  deferRendering(promise) {
    assert('deferRendering needs a promise', typeof promise?.then === 'function');

    infoOf(this)?.deferRendering(promise);
  }
}
