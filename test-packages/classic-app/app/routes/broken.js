import Route from '@ember/routing/route';

export default class BrokenRoute extends Route {
  model() {
    throw new Error('The broken route failed');
  }
}
