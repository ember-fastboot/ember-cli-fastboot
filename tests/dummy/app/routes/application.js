import Ember from 'ember';

export default Ember.Route.extend({
  fastboot: Ember.inject.service(),
  shoebox: Ember.computed.readOnly('fastboot.shoebox'),

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
