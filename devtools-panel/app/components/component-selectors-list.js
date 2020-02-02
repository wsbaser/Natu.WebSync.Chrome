import Component from '@ember/component';

export default Component.extend({
	elementId: 'selectorsList',
	classNameBindings:[
		'isExpanded:expanded'
	],
	selectorHighlighter: Ember.inject.service(),
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
		},
		onSelect(componentSelector){
			this.get('selectors').forEach(function(s){
				s.set('isSelected', s == componentSelector);
			});
		},
		onMouseEnter(componentSelector){
			this.get('selectorHighlighter').highlight(componentSelector.get('selector'));
		},
		onMouseLeave(){
			this.get('selectorHighlighter').removeHighlighting();
		},
		onEdit(componentSelector){
		},
		onRemove(componentSelector){
			this.selectors.removeObject(componentSelector);
		}
	}
});
