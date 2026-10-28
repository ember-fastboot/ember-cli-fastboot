import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class TeapotRoute extends Route {
  @service fastboot;

  model() {
    this.fastboot.response.statusCode = 418;
    this.fastboot.response.headers.set('x-teapot', 'short and stout');
  }
}
