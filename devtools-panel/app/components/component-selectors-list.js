import Component from '@ember/component';

export default Component.extend({
	elementId: 'selectorsList',
	classNameBindings:[
		'isExpanded:expanded'
	],
	selectorsCountStatus: Ember.computed('selectors.[]', function(){
		let count = this.get('selectors.length');
		if(count%10==1 && count%100!=11){
			return count + " selector";
		}
		return count + " selectors";
	}),
	actions:{
		expandSelectorsList(){
			this.toggleProperty('isExpanded');
		}
	}
});
