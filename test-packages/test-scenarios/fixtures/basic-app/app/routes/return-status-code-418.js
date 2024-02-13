import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ReturnStatusCode418Route extends Route {
  @service fastboot;

  model() {
    this.fastboot.response.statusCode = 418;
  }
}
