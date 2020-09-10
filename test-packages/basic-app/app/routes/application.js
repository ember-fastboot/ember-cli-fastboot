import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service fastboot;

  model() {
    if (this.fastboot.isFastBoot) {
      const shoebox = this.fastboot.shoebox;
      shoebox.put('key1', { newZealand: 'beautiful' });
      shoebox.put('key2', { moa: '20 foot tall bird!' });
    }
  }
}
