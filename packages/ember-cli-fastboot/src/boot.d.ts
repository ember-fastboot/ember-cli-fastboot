import type Application from '@ember/application';

export function boot(
  Application: typeof Application,
  config: { APP?: Record<string, unknown>; rootURL?: string },
): Application;
