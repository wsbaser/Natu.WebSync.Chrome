import Ember from 'ember';

export default Ember.Controller.extend({
	pages: Ember.computed.alias('model.pages')
});
