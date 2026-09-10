import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class extends Route {
  @service fastboot;

  model() {
    return {
      path: this.get('fastboot.request.path')
    };
  }
};
