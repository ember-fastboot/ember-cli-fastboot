import FastBoot from './index.js';

/**
 * A Connect-style request handler, `(req, res, next)`.
 * It works with `node:http`, Express, Connect, and the Vite dev server.
 *
 * Put it after the handler for static files.
 *
 * - A URL that the app has no route for goes to `next()`.
 * - A failed render goes to `next(error)`.
 *   With `resilient: true`, the handler sends the page without rendered content
 *   instead, so that the browser renders it.
 *
 * @param {FastBoot | object} fastbootOrOptions a `FastBoot`, or options for `new FastBoot()`
 * @param {object} [options]
 * @param {boolean} [options.resilient]
 * @param {(req) => object} [options.metadata] the `fastboot.metadata` of each request
 */
export default function fastbootMiddleware(fastbootOrOptions, options = {}) {
  let fastboot = fastbootOrOptions instanceof FastBoot ? fastbootOrOptions : new FastBoot(fastbootOrOptions);
  let resilient = options.resilient ?? fastbootOrOptions.resilient ?? false;

  return async function fastbootHandler(req, res, next) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next();
      return;
    }

    let result;

    try {
      result = await fastboot.visit(req.originalUrl ?? req.url, {
        request: req,
        response: res,
        metadata: options.metadata?.(req),
        resilient: true,
      });
    } catch (error) {
      next(error);
      return;
    }

    if (result.error?.name === 'UnrecognizedURLError') {
      next();
      return;
    }

    if (result.error) {
      if (!resilient) {
        next(result.error);
        return;
      }

      console.error('[fastboot] The render failed. The browser renders the page instead.', result.error);
    }

    for (let name of result.headers.keys()) {
      res.setHeader(name, result.headers.getAll(name));
    }

    if (!res.hasHeader('content-type')) {
      res.setHeader('content-type', 'text/html; charset=utf-8');
    }

    res.statusCode = result.statusCode;
    res.end(req.method === 'HEAD' ? undefined : result.html());
  };
}
