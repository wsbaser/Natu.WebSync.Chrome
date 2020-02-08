import Component from '@ember/component';

export default Component.extend({
	elementId: 'selectorsList',
	classNameBindings:[
		'isExpanded:expanded'
	],
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
	highlightComponentsCheched(){
 		return $(highlightComponents).prop("checked");
	},
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
			var nameSpanEl = window.event.target.tagName=="TD"?
				window.event.target.children[0]:
				window.event.target;
			Ember.run.scheduleOnce('afterRender', function(){
	        	nameSpanEl.focus();
	        	var range = document.createRange();
	        	range.selectNodeContents(nameSpanEl);
	        	window.getSelection().removeAllRanges();
	        	window.getSelection().addRange(range);	        	
			});
		},
		onHighlightComponents(){
			this.set("componentsAreHighlighted", this.highlightComponentsCheched());
			if(this.get("componentsAreHighlighted")){
				this.get("selectorHighlighter").highlightComponents(this.get('selectors'));
			}else{
				this.get("selectorHighlighter").removeComponentsHighlighting();
			}
		},
		onNameKeydown(componentSelector){
			let newName = window.event.target.innerText.trim();
			if(window.event.key=="Enter"){
				componentSelector.set("nameIsEdited", false);
				
				if(newName){
					componentSelector.set("name", newName);
				}else{
					window.event.target.innerText = componentSelector.get("name");
				}
				window.event.preventDefault();
			}else if(newName.length==100){
				window.event.preventDefault();
			}
		},
		onNameBlur(componentSelector){
			componentSelector.set("nameIsEdited", false);
			let newName = window.event.target.innerText.trim();	
			if(newName){
				componentSelector.set("name", newName);
			}else{
				window.event.target.innerText = componentSelector.get("name");
			}
		}
	}
});
