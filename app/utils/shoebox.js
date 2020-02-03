import EObject from '@ember/object';
import { assert } from '@ember/debug';

export default EObject.extend({
  put(key, value) {
    assert('shoebox.put is only invoked from the FastBoot rendered application', this.get('fastboot.isFastBoot'));
    assert('the provided key is a string', typeof key === 'string');

    let fastbootInfo = this.get('fastboot._fastbootInfo');
    if (!fastbootInfo.shoebox) { fastbootInfo.shoebox = {}; }

    fastbootInfo.shoebox[key] = value;
  },

  retrieve(key) {
    if (this.get('fastboot.isFastBoot')) {
      let shoebox = this.get('fastboot._fastbootInfo.shoebox');
      if (!shoebox) { return; }

      return shoebox[key];
    }

    let shoeboxItem = this.get(key);
    if (shoeboxItem) { return shoeboxItem; }

    let el = document.querySelector(`#shoebox-${key}`);
    if (!el) { return; }
    let valueString = el.textContent;
    if (!valueString) { return; }

    shoeboxItem = JSON.parse(valueString);
    this.set(key, shoeboxItem);

    return shoeboxItem;
  }
});