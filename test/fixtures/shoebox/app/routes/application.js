import Ember from 'ember';

export default Ember.Route.extend({
  fastboot: Ember.inject.service(),
  shoebox: Ember.computed.readOnly('fastboot.shoebox'),

  model() {
    let fastboot = this.get('fastboot');
    let shoebox = this.get('shoebox');
    if (fastboot.get('isFastBoot')) {
      shoebox.put('key1', { foo: 'bar' });
      shoebox.put('key2', { zip: 'zap' });
    }
  }
});
