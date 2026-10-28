import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';

export const root = resolve(import.meta.dirname, '..');

/**
 * The builds that `global-setup.js` makes:
 *
 * - classic: a development build, with Ember's assertions
 * - vite: a production build
 */
export const builds = {
  classic: {
    distPath: join(root, 'test-packages/classic-app/dist'),
  },
  vite: {
    distPath: join(root, 'test-packages/vite-app/dist/client'),
    entry: join(root, 'test-packages/vite-app/dist/server/app-ssr.mjs'),
  },
};

const TYPES = {
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
};

/**
 * Serves the files of `distPath`, and passes every other request to `handler`.
 * Resolves with the origin of the server.
 */
export async function serve(distPath, handler) {
  let server = createServer(async (req, res) => {
    let path = join(distPath, decodeURIComponent(req.url.split('?')[0]));

    if (path.startsWith(distPath) && extname(path) && (await isFile(path))) {
      res.setHeader('content-type', TYPES[extname(path)] ?? 'application/octet-stream');
      res.end(await readFile(path));
      return;
    }

    handler(req, res, (error) => {
      res.statusCode = error ? 500 : 404;
      res.end(error ? `next(error): ${error.message}` : 'next()');
    });
  });

  await new Promise((done) => server.listen(0, '127.0.0.1', done));

  return {
    origin: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((done) => server.close(done)),
  };
}

async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

/**
 * The HTML without Glimmer's serialization comments,
 * so that assertions can match the rendered text.
 */
export function withoutMarkers(html) {
  return html.replace(/<!--%[^%]*%-->/g, '');
}
