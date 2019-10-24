'use strict';
// Partially implements Headers from the Fetch API
// https://developer.mozilla.org/en-US/docs/Web/API/Headers
class FastBootHeaders {
  constructor(headers) {
    headers = headers || {};
    this.headers = {};

    for (let header in headers) {
      let value = headers[header];

      // Express gives us either a string
      // or an array of strings if there are multiple values.
      // We want to support the Header spec
      // so we will coerce to an array always.
      if (typeof value === 'string') {
        value = [value];
      }

      this.headers[header.toLowerCase()] = value;
    }
  }

  append(header, value) {
    let _header = header.toLowerCase();

    if (!this.has(_header)) {
      this.headers[_header] = [];
    }

    this.headers[_header].push(value);
  }

  delete(header) {
    delete this.headers[header.toLowerCase()];
  }

  entries() {
    let entries = [];

    for(let key in this.headers) {
      let values = this.headers[key];
      for(let index = 0; index < values.length; ++index ) {
        entries.push([key, values[index]]);
      }
    }

    return entries[Symbol.iterator]();
  }

  get(header) {
    return this.getAll(header)[0] || null;
  }

  getAll(header) {
    return this.headers[header.toLowerCase()] || [];
  }

  has(header) {
    return this.headers[header.toLowerCase()] !== undefined;
  }

  keys() {
    let entries = [];

    for(let key in this.headers) {
      let values = this.headers[key];
      for(let index = 0; index < values.length; ++index ) {
        entries.push(key);
      }
    }

    return entries[Symbol.iterator]();
  }

  set(header, value) {
    header = header.toLowerCase();
    this.headers[header] = [value];
  }

  values() {
    let entries = [];

    for(let key in this.headers) {
      let values = this.headers[key];
      for(let index = 0; index < values.length; ++index ) {
        entries.push(values[index]);
      }
    }

    return entries[Symbol.iterator]();
  }

  unknownProperty(maybeHeader) {
    console.warn(`You called \`Ember.get(headers, '${maybeHeader}')\` with a FastBootHeaders instance as first argument. FastBootHeader is not an Ember object and you should use \`headers.get('${maybeHeader}')\` instead.`);
    return this.get(maybeHeader);
  }
}

module.exports = FastBootHeaders;
