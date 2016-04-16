// Partially implements Headers from the Fetch API
// https://developer.mozilla.org/en-US/docs/Web/API/Headers
function FastBootHeaders(headers) {
  this.headers = headers
}

FastBootHeaders.prototype.get = function(header) {
  return this.getAll(header)[0] || null;
}

FastBootHeaders.prototype.getAll = function(header) {
  var headerValue = this.headers[header.toLowerCase()];

  if (headerValue) {
    return headerValue.split(', ');
  }

  return [];
}

FastBootHeaders.prototype.has = function(header) {
  return this.headers[header.toLowerCase()] !== undefined;
}

module.exports = FastBootHeaders;
