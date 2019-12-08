import Ember from 'ember';

export default Ember.Object.extend({
	isUnlocked: Ember.computed('isSelected', 'part.isCssStyle', 'part.isEditable', function(){
		return this.get('isSelected') && this.get('part.isCssStyle') && this.get('part.isEditable');
	})
});