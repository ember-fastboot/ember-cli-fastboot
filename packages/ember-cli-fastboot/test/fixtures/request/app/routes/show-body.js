import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class extends Route {
  @service fastboot;

  model() {
    return {
      body: this.fastboot.request.body,
    };
  }
}
