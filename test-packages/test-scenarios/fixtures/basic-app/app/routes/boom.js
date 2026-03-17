import Route from '@ember/routing/route';

export default class BoomRoute extends Route {
  model() {
    throw 'BOOM';
  }
}
