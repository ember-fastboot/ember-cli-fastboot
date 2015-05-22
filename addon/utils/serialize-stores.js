import Ember from 'ember';
import { knownStores } from '../store';

const { create } = Ember;

export default function(container) {
  const results = create(null);

  for (let index = 0, length = knownStores.length; index < length; index++) {
    const storeFullName = knownStores[index];
    const store = container.lookup(storeFullName);

    if (store && store.serializeCache) {
      results[storeFullName] = store.serializeCache();
    }
  }

  return results;
}
