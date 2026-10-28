import type { FastBootOptions, Result } from './index.js';

export interface PrerenderOptions extends Omit<FastBootOptions, 'vite' | 'resilient'> {
  /** The URLs to render, for example `['/', '/about']`. */
  routes: string[];
  distPath: string;
  /** The HTML file in `distPath` to render into. The default is `index.html`. */
  template?: string;
  /** The directory for the pages. The default is `distPath`. */
  outDir?: string;
  /** Changes the HTML of a page before it is written. */
  transformHtml?: (html: string, page: { url: string; result: Result }) => string;
}

export interface PrerenderedPage {
  url: string;
  file: string;
  statusCode: number;
}

/**
 * Renders each URL and writes the page as `<outDir>/<url>/index.html`.
 * Rejects with an `AggregateError` when a page fails or has a status of 400 or more.
 */
export function prerender(options: PrerenderOptions): Promise<PrerenderedPage[]>;
