import { Project, Scenarios } from 'scenario-tester';
import { dirname } from 'path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export function baseApp() {
  return Project.fromDir(dirname(require.resolve('../classic-app-template/package.json')), {
    linkDevDeps: true,
  });
}

/**
 * @param {Project} project
 */
async function lts_3_16(project) {
  project.linkDevDependency('ember-source', { baseDir: '.', resolveName: 'ember-source-3.16' });
  project.linkDevDependency('ember-cli', { baseDir: '.', resolveName: 'ember-cli-3.16' });
}

/**
 * @param {Project} project
 */
async function lts_3_28(project) {
  project.linkDevDependency('ember-source', { baseDir: '.', resolveName: 'ember-source-3.28' });
  project.linkDevDependency('ember-cli', { baseDir: '.', resolveName: 'ember-cli-3.28' });
}

/**
 * @param {Project} project
 */
async function lts_4_12(project) {
  project.linkDevDependency('ember-source', { baseDir: '.', resolveName: 'ember-source-4.12' });
  project.linkDevDependency('ember-cli', { baseDir: '.', resolveName: 'ember-cli-4.12' });
}

/**
 * @param {Project} project
 */
async function lts_5_12(project) {
  project.linkDevDependency('ember-source', { baseDir: '.', resolveName: 'ember-source-5.12' });
  project.linkDevDependency('ember-cli', { baseDir: '.', resolveName: 'ember-cli-5.12' });
  project.linkDevDependency('ember-data', { baseDir: '.', resolveName: 'ember-data-5.8' });
  project.linkDevDependency('@ember/string', { baseDir: '.' });
  project.linkDevDependency('ember-resolver', { baseDir: '.' });
  project.linkDevDependency('ember-page-title', { baseDir: '.' });
}

/**
 * @param {Project} project
 */
async function lts_6_12(project) {
  project.linkDevDependency('ember-source', { baseDir: '.', resolveName: 'ember-source-6.12' });
  project.linkDevDependency('ember-cli', { baseDir: '.', resolveName: 'ember-cli-6.12' });
  project.linkDevDependency('ember-data', { baseDir: '.', resolveName: 'ember-data-5.8' });
  project.linkDevDependency('@ember/string', { baseDir: '.' });
  project.linkDevDependency('ember-resolver', { baseDir: '.' });
  project.linkDevDependency('ember-page-title', { baseDir: '.' });
}

/**
 * @param {Project} project
 */
async function release(project) {
  project.linkDevDependency('ember-source', { baseDir: '.', resolveName: 'ember-source-latest' });
  project.linkDevDependency('ember-cli', { baseDir: '.', resolveName: 'ember-cli-latest' });
  project.linkDevDependency('ember-data', { baseDir: '.', resolveName: 'ember-data-5.8' });
  project.linkDevDependency('@ember/string', { baseDir: '.' });
  project.linkDevDependency('ember-resolver', { baseDir: '.' });
  project.linkDevDependency('ember-page-title', { baseDir: '.' });
  project.linkDevDependency('ember-cli-htmlbars', { baseDir: '.' });
  project.linkDevDependency('@ember/test-helpers', { baseDir: '.' });
  project.linkDevDependency('ember-qunit', { baseDir: '.' });
  project.linkDevDependency('ember-cli-babel', { baseDir: '.' });
  project.linkDevDependency('@babel/core', { baseDir: '.' });
}

/**
 *
 * @param {Scenarios} scenarios
 * @returns
 */
function supportMatrix(scenarios) {
  return scenarios.expand({
    lts_3_16,
    lts_3_28,
    lts_4_12,
    lts_5_12,
    lts_6_12,
    release,
    // TODO add these when they are working
    // beta,
    // canary,
  });
}

export const appScenarios = supportMatrix(Scenarios.fromProject(baseApp));
