import Route from '@ember/routing/route';

export default class extends Route {
  model() {
    if (typeof FastBoot !== 'undefined') {
      return window.myGlobal;
    }
  }
}
