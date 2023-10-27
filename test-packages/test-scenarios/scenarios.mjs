import { Project, Scenarios } from 'scenario-tester';
import { dirname } from 'path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

function baseApp() {
  return Project.fromDir(dirname(require.resolve('../classic-app-template/package.json')), {
    linkDevDeps: true,
  });
}

export const appScenarios = Scenarios.fromProject(baseApp);
