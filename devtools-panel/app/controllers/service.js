import Ember from 'ember';

export default Ember.Controller.extend({
	pages: Ember.computed.alias('model.pages'),
	pagesSorting: ['id:desc'],
	sortedPages: Ember.computed.sort('pages','pagesSorting'),
});
