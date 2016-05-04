import Ember from 'ember';

export default Ember.Component.extend({
  fastboot: Ember.inject.service(),

  init() {
    this._super(...arguments);

    let deferred = Ember.RSVP.defer();

    let runLater = Ember.run.later(() => {
      this.set('setLater', 'foo');
      deferred.resolve()
      this.set('runLater', null);
      this.set('deferred', null);
    }, 100);

    this.runLater =  runLater;
    this.deferred = deferred;

    this.get('fastboot').deferRendering(deferred.promise);
  },

  destroy() {
    let runLater = this.get('runLater');
    let deferred = this.get('deferred');

    if (runLater) {
      Ember.run.cancel(runLater);
      deferred.reject('cancelled');
    }

    this._super(...arguments);
  }
});
