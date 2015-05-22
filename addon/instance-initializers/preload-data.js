import Ember from 'ember';

const { $, keys } = Ember;

export default {
  initialize(instance) {
    if (!$) {
      return;
    }

    const rawDump = Ember.$('meta[name="preload-data"]').attr('content');

    if (!rawDump) {
      return;
    }

    const data = JSON.parse(decodeURIComponent(rawDump));
    const storeNames = keys(data);

    for (let index = 0, length = storeNames.length; index < length; index++) {
      const storeFullName = storeNames[index];
      const store = instance.container.lookup(storeFullName);
      const storeData = data[storeFullName];

      if (store && store.populateCache) {
        store.populateCache(storeData);
      }
    }
  }
};
