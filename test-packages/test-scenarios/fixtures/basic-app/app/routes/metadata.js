import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default Route.extend({
  fastboot: service(),

  model() {
    if (this.get('fastboot.isFastBoot') && this.fastboot.metadata) {
      return 'test fastboot metadata';
    }
  },
});
