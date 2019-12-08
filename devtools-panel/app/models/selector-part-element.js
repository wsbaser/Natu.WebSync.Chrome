import Ember from 'ember';

export default Ember.Object.extend({
	isUnlocked: Ember.computed('isSelected', 'part.isEditable', 'part.isBlank', function(){
		return this.get('isSelected') && this.get('part.isEditable');
	})
});