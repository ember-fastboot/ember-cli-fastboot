import { _getCurrentRunLoop, _hasScheduledTimers } from '@ember/runloop';

/**
 * Resolves when the run loop has no more work scheduled,
 * for example timers from `later()`.
 *
 * Export it from the SSR entry of a Vite app,
 * and FastBoot waits for it before it sends a page.
 */
export async function settled() {
  await new Promise((resolve) => setTimeout(resolve, 0));

  while (_getCurrentRunLoop() || _hasScheduledTimers()) {
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}
