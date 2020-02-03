import Component from '@ember/component';

export default Component.extend({
	elementId: 'selectorsList',
	classNameBindings:[
		'isExpanded:expanded'
	],
	componentsAreHighlighted: false,
	selectorHighlighter: Ember.inject.service(),
	clipboard: Ember.inject.service(),
	onComponentsListChange: Ember.observer('selectors.[]', function(){
		if(this.get("componentsAreHighlighted")){
			this.get("selectorHighlighter").highlightComponents(this.get('selectors'));
		}
	}),
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
			// this.get('selectors').forEach(function(s){
			// 	s.set('isSelected', s == componentSelector);
			// });
		},
		onMouseEnter(componentSelector){
			this.get('selectorHighlighter').highlight(componentSelector.get('selector'));
		},
		onMouseLeave(){
			this.get('selectorHighlighter').removeHighlighting();
		},
		onEdit(componentSelector){
			if(this.get("onEdit")){
				this.get("onEdit")(componentSelector);
			}
		},
		onRemove(componentSelector){
			this.selectors.removeObject(componentSelector);
			this.get('selectorHighlighter').removeHighlighting();
		},
		onClear(){
			this.selectors.clear();
		},
		onCopy(){
			var text="";
			this.selectors.forEach(function(item){
				text+=item.get('value')+"|"+item.get('name')+"\r\n";
			});
			this.get('clipboard').copy(text);
		},
		onEditName(componentSelector){
			componentSelector.toggleProperty("nameIsEdited");
		},
		onHighlightComponents(){
			this.toggleProperty("componentsAreHighlighted");
			if(this.get("componentsAreHighlighted")){
				this.get("selectorHighlighter").highlightComponents(this.get('selectors'));
			}else{
				this.get("selectorHighlighter").removeComponentsHighlighting();
			}
		}
	}
});
