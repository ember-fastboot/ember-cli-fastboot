import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class StoreRoute extends Route {
  @service store;

  model() {
    return { cacheReady: Boolean(this.store.cache) };
  }
}
