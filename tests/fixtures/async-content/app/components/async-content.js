import Ember from 'ember';

export default Ember.Component.extend({
  fastboot: Ember.inject.service(),

  init() {
    this._super(...arguments);

    let deferred = Ember.RSVP.defer();

    Ember.run.later(() => {
      if (!this.get('isDestroyed')) {
        this.set('setLater', 'foo');
      }
      deferred.resolve()
    }, 100);

    this.get('fastboot').deferRendering(deferred.promise);
  }
});
