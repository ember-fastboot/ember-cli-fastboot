import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return {
      importStatus: window.browserImportStatus || 'FastBoot default default value'
    };
  }
});
