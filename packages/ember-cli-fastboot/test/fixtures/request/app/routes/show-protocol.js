import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class extends Route {
  @service fastboot;

  model() {
    return {
      protocol: this.fastboot.request.protocol,
    };
  }
}
