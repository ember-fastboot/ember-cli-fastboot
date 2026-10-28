import type { IncomingMessage, ServerResponse } from 'node:http';

import type FastBoot from './index.js';
import type { FastBootOptions } from './index.js';

export interface MiddlewareOptions {
  /** When true, a failed render sends the page without rendered content, for the browser to render. */
  resilient?: boolean;
  /** The `fastboot.metadata` of each request. */
  metadata?: (req: IncomingMessage) => unknown;
}

export default function fastbootMiddleware(
  fastboot: FastBoot | FastBootOptions,
  options?: MiddlewareOptions,
): (req: IncomingMessage, res: ServerResponse, next: (error?: unknown) => void) => Promise<void>;
