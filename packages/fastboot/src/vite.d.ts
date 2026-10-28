import type { Plugin } from 'vite';

import type { AllowedHost } from './index.js';

export interface FastBootPluginOptions {
  /** The SSR entry module. The default is `app/app-ssr.js`. */
  entry?: string;
  allowedHosts?: AllowedHost[];
  settledTimeout?: number;
  redirectCode?: number;
  /** Pages to write at build time, with `vite build`. */
  prerender?: {
    /** The URLs of the pages, for example `['/', '/about']`. */
    routes: string[];
    /** The built HTML file to render into. The default is `index.html`. */
    template?: string;
    /**
     * The route of a source module, for example `'app/templates/blog.gjs'` → `'blog'`.
     * A page links the stylesheets of the modules of its routes.
     * The default reads the routes that Embroider splits, and `app/templates`, `app/routes`, and `app/controllers`.
     */
    routeName?: (source: string) => string | undefined;
  };
}

export function fastboot(options?: FastBootPluginOptions): Plugin;
