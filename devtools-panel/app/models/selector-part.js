import Ember from 'ember';

export default Ember.Object.extend({
	viewableElements: Ember.computed('elements',function(){
		var elements = this.get('elements');
		console.log("Update viewable elements");
		console.log(elements);
	}),
	fullSelectorObj: Ember.computed('fullSelector', function(){
		return this.get('isXPath')?
			{xpath: this.get('fullSelector')}:
			{css: this.get('fullSelector')};
	})
});