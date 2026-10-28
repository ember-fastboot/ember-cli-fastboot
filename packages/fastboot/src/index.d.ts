import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ViteDevServer } from 'vite';

export type AllowedHost = string | RegExp;

export interface FastBootOptions {
  /** The directory of the build that has `index.html`: `dist` (classic) or `dist/client` (Vite). */
  distPath?: string;
  /** The SSR entry module: a built file, or with `vite`, a source path such as `/app/app-ssr.js`. */
  entry?: string;
  /** A Vite dev server. FastBoot then renders the current source files in this process. */
  vite?: ViteDevServer;
  /** The HTML file of the build (or with `vite`, of the app) to render into. The default is `index.html`. */
  template?: string;
  /** The number of worker threads. The default is `os.availableParallelism()`. */
  workers?: number;
  /** Hosts that `fastboot.request.host` accepts. */
  allowedHosts?: AllowedHost[];
  /** When true, `visit()` resolves with `result.error` set instead of a rejection. */
  resilient?: boolean;
  /** Milliseconds to wait for the app to settle. The default is 10000. */
  settledTimeout?: number;
  /** The status code of a redirect during a render. The default is 307. */
  redirectCode?: number;
}

export interface VisitOptions {
  request?: IncomingMessage | { method?: string; url: string; headers?: Record<string, string | string[]> };
  response?: ServerResponse;
  /** Data for `fastboot.metadata`. It must survive `structuredClone`. */
  metadata?: unknown;
  /** The HTML page to render into. The default is the `template` of the build. */
  html?: string;
  resilient?: boolean;
}

export declare class FastBootHeaders {
  constructor(headers?: Record<string, string | number | string[]>);
  append(name: string, value: string): void;
  delete(name: string): void;
  entries(): IterableIterator<[string, string]>;
  forEach(callback: (value: string, name: string, headers: FastBootHeaders) => void, thisArg?: unknown): void;
  get(name: string): string | null;
  getAll(name: string): string[];
  has(name: string): boolean;
  keys(): IterableIterator<string>;
  set(name: string, value: string): void;
  values(): IterableIterator<string>;
}

export declare class Result {
  statusCode: number;
  headers: FastBootHeaders;
  error: Error | undefined;
  /** The names of the active routes after the render, from the top: `['application', 'blog', 'blog.post']`. */
  routeNames: string[];
  /** The full HTML page. */
  html(): string;
  /** The rendered content of `<head>` and `<body>`. */
  domContents(): { head: string; body: string };
}

export default class FastBoot {
  constructor(options: FastBootOptions);
  resilient: boolean;
  visit(url: string, options?: VisitOptions): Promise<Result>;
  reload(options?: { distPath?: string; entry?: string }): Promise<void>;
  ready(): Promise<void>;
  destroy(): Promise<void>;
}
