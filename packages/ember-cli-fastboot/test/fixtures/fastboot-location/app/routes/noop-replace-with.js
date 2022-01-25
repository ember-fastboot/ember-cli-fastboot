import Route from '@ember/routing/route';

export default class extends Route {
  beforeModel() {
    this.replaceWith('noop-replace-with');
  }
}
