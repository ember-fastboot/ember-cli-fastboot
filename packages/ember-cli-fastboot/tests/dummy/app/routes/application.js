import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class extends Route {
  @service fastboot;

  get shoebox() {
    return this.fastboot.shoebox;
  }

  model() {
    let fastboot = this.fastboot;
    let shoebox = this.shoebox;

    if (!fastboot.isFastBoot) {
      return {
        key1: shoebox.retrieve('key1'),
        key2: shoebox.retrieve('key2'),
      };
    }
  }
}
