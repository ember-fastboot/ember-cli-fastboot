import Ember from "ember";

let alias = Ember.computed.alias;

export default Ember.Service.extend({
  cookies: alias('_fastbootInfo.cookies'),
  headers: alias('_fastbootInfo.headers')
});
