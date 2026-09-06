import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class extends Route {
  @service fastboot;

  model() {
    return {
      desiredHeader: this.get('fastboot.request.headers').get('X-Fastboot-Info')
    };
  }
};
