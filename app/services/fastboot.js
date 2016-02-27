import Ember from "ember";

let alias = Ember.computed.alias;
let computed = Ember.computed;

export default Ember.Service.extend({
  cookies: alias('_fastbootInfo.cookies'),
  headers: alias('_fastbootInfo.headers'),
  host: computed(function() {
    return this._fastbootInfo.host();
  })
});
