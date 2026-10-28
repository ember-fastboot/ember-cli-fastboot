import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class RequestRoute extends Route {
  @service fastboot;

  model() {
    let { request, metadata } = this.fastboot;

    return {
      path: request?.path,
      method: request?.method,
      cookie: request?.cookies.flavor,
      header: request?.headers.get('x-fixture'),
      query: request?.queryParams.q,
      greeting: metadata?.greeting,
    };
  }
}
