import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import { readOnly } from '@ember/object/computed';

export default Route.extend({
  fastboot: inject(),
  shoebox: readOnly('fastboot.shoebox'),

  model() {
    let fastboot = this.get('fastboot');
    let shoebox = this.get('shoebox');
    if (!fastboot.get('isFastBoot')) {
      return {
        key1: shoebox.retrieve('key1'),
        key2: shoebox.retrieve('key2')
      };
    }
  }
});
