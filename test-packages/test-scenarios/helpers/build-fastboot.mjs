import { join } from 'path';
import FastBoot from 'fastboot';

export default async function buildFastboot(app) {
  let result = await app.execute(`node node_modules/ember-cli/bin/ember build`);

  if (result.exitCode !== 0) {
    throw new Error(`failed to build app for fastboot: ${result.output}`);
  }

  return new FastBoot({
    distPath: join(app.dir, 'dist'),
    resilient: false,
  });
}
