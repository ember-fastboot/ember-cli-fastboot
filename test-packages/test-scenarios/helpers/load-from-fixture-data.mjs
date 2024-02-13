import { join } from 'path';
import { readFileSync } from 'fs';
import { globbySync } from 'globby';
import { set } from 'lodash-es';

export default function loadFromFixtureData(fixtureNamespace) {
  const root = join('.', 'fixtures', fixtureNamespace);
  const paths = globbySync('**', { cwd: root, dot: true });
  const fixtureStructure = {};

  paths.forEach((path) => {
    set(fixtureStructure, path.split('/'), readFileSync(join(root, path), 'utf8'));
  });

  return fixtureStructure;
}
