/**
 * Per-render data for the `fastboot` service of `ember-cli-fastboot`.
 *
 * The server registers one `FastBootInfo` on each application instance
 * as `info:-fastboot`.
 */
export class FastBootInfo {
  #deferred = [];

  constructor({ request, metadata, allowedHosts, responseHeaders }) {
    this.request = request ? new FastBootRequest(request, allowedHosts) : undefined;
    this.response = new FastBootResponse(responseHeaders);
    this.metadata = metadata ?? {};
    this.shoebox = {};
  }

  deferRendering(promise) {
    this.#deferred.push(promise);
  }

  /**
   * Waits for every promise that was passed to `deferRendering`,
   * also the ones that were added while it waited.
   */
  async settled() {
    let done = 0;

    while (done < this.#deferred.length) {
      let pending = this.#deferred.slice(done);

      done = this.#deferred.length;
      await Promise.all(pending);
    }
  }
}

export class FastBootRequest {
  #allowedHosts;

  constructor(request, allowedHosts) {
    this.#allowedHosts = allowedHosts;

    let url = new URL(request.url, 'http://localhost');

    this.method = request.method;
    this.path = request.url;
    this.protocol = `${request.protocol}:`;
    this.headers = new FastBootHeaders(request.headers);
    this.queryParams = Object.fromEntries(url.searchParams);
    this.body = request.body;
    this.cookies = parseCookies(this.headers.get('cookie'));
  }

  /**
   * The `Host` header, when it matches an entry of `allowedHosts`.
   */
  get host() {
    if (!this.#allowedHosts) {
      throw new Error('FastBoot needs the `allowedHosts` option to read the host of a request.');
    }

    let host = this.headers.get('host');

    if (!isAllowedHost(host, this.#allowedHosts)) {
      throw new Error(`The Host header does not match an entry of allowedHosts. Host header: ${host}`);
    }

    return host;
  }
}

export class FastBootResponse {
  constructor(headers) {
    this.headers = new FastBootHeaders(headers);
    this.statusCode = 200;
  }
}

/**
 * Headers with one or more values for each name.
 * Names are case-insensitive.
 */
export class FastBootHeaders {
  #map = new Map();

  constructor(headers = {}) {
    for (let [name, value] of Object.entries(headers)) {
      if (value === undefined) continue;

      this.#map.set(name.toLowerCase(), Array.isArray(value) ? value.map(String) : [String(value)]);
    }
  }

  append(name, value) {
    let key = name.toLowerCase();

    if (!this.#map.has(key)) {
      this.#map.set(key, []);
    }

    this.#map.get(key).push(String(value));
  }

  delete(name) {
    this.#map.delete(name.toLowerCase());
  }

  entries() {
    let result = [];

    for (let [name, values] of this.#map) {
      for (let value of values) {
        result.push([name, value]);
      }
    }

    return result[Symbol.iterator]();
  }

  forEach(callback, thisArg) {
    for (let [name, value] of this.entries()) {
      callback.call(thisArg, value, name, this);
    }
  }

  get(name) {
    return this.#map.get(name.toLowerCase())?.[0] ?? null;
  }

  getAll(name) {
    return this.#map.get(name.toLowerCase())?.slice() ?? [];
  }

  has(name) {
    return this.#map.has(name.toLowerCase());
  }

  keys() {
    return this.#map.keys();
  }

  set(name, value) {
    this.#map.set(name.toLowerCase(), [String(value)]);
  }

  values() {
    let result = [];

    for (let values of this.#map.values()) {
      for (let value of values) {
        result.push(value);
      }
    }

    return result[Symbol.iterator]();
  }

  toJSON() {
    return Object.fromEntries(this.#map);
  }
}

/**
 * An entry of `allowedHosts` is a host string, a `RegExp`,
 * or a regular expression source in slashes:
 *
 *   'example.com'
 *   /^(.+\.)?example\.com$/
 *   '/^(.+\\.)?example\\.com$/'
 */
export function isAllowedHost(host, allowedHosts) {
  if (!host || !allowedHosts) return false;

  return allowedHosts.some((entry) => {
    if (entry instanceof RegExp) return entry.test(host);
    if (entry.length > 1 && entry.startsWith('/') && entry.endsWith('/')) {
      return new RegExp(entry.slice(1, -1)).test(host);
    }

    return entry === host;
  });
}

function parseCookies(header) {
  let cookies = {};

  if (!header) return cookies;

  for (let pair of header.split(';')) {
    let index = pair.indexOf('=');

    if (index < 0) continue;

    let name = pair.slice(0, index).trim();
    let value = pair.slice(index + 1).trim();

    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }

    if (name && !(name in cookies)) {
      try {
        cookies[name] = decodeURIComponent(value);
      } catch {
        cookies[name] = value;
      }
    }
  }

  return cookies;
}
