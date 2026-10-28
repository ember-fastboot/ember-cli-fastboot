import EmberApp from 'ember-cli/lib/broccoli/ember-app.js';
import { compatBuild } from '@embroider/compat';

export default async function (defaults) {
  const { setConfig } = await import('@warp-drive/core/build-config');
  const { buildOnce } = await import('@embroider/vite');

  const app = new EmberApp(defaults, {});

  setConfig(app, import.meta.dirname, { compatWith: '5.8' });

  return compatBuild(app, buildOnce, { splitAtRoutes: ['lazy'] });
}
