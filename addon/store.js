import Ember from 'ember';
import DS from 'ember-data';

const keys = Ember.keys;
const create = Ember.create;
export const knownStores = [];

export default DS.Store.extend({
  init() {
    this._super(...arguments);
    knownStores.push(this._debugContainerKey);
  },

  populateCache(dump) {
    const types = keys(dump);

    for (let index = 0, length = types.length; index < length; index++) {
      const typeKey = types[index];
      const records = dump[typeKey];

      this.pushMany(typeKey, records);
    }
  },

  serializeCache() {
    let results = create(null);

    const types = keys(this.typeMaps);

    for (let index = 0, length = types.length; index < length; index++) {
      const typeId = types[index];
      const typeKey = this.typeMaps[typeId].type.typeKey;
      const records = this.typeMaps[typeId].records;
      const recordCount = records.length;

      results[typeKey] = [];

      for (let currentRecord = 0; currentRecord < recordCount; currentRecord++) {
        const record = records[currentRecord];
        const serializedRecord = record.toJSON({ includeId: true });

        results[typeKey].push(serializedRecord);
      }
    }

    return results;
  }
});
