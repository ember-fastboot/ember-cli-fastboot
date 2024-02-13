import Route from '@ember/routing/route';

export default class ImportsRoute extends Route {
  model() {
    return {
      importStatus: window.browserImportStatus || 'FastBoot default default value'
    };
  }
}
