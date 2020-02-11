import Ember from 'ember';

export default Ember.Object.extend({
	nameIsEdited: false,
	value: Ember.computed('selector', function(){
		return this.get('selector.css')?
			this.get('selector.css'):
			this.get('selector.xpath');
	})
});
