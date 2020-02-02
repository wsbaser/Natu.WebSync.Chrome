import DS from 'ember-data';

export default Ember.Object.extend({
	value: Ember.computed('selector', function(){
		return this.get('selector.scss');
	})
});
