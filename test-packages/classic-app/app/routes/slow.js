import Route from '@ember/routing/route';

export default class SlowRoute extends Route {
  async model() {
    await new Promise((resolve) => setTimeout(resolve, 30));

    return 'slow model';
  }
}
