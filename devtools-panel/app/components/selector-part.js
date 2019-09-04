import Ember from 'ember';

export default Ember.Component.extend({
	tagName: 'span',
	classNames: ['part'],
	classNameBindings:[
		'isExist:exist',
		'isSeveral:several', 
		'hasHidden:hidden',
		'isNotDisplayed:not-displayed',
		'part.isSelected:selected'],
	selectorHighlighter: Ember.inject.service(),
	selectorInspector: Ember.inject.service(),
	isXPath:false,
	isNotDisplayed: Ember.computed('part.displayed', function(){
		return !this.get('part.displayed');
	}),
	isSeveral: Ember.computed('part.count', function(){
		return this.get('part.count')>1;
	}),
	isExist: Ember.computed('part.count', function(){
		return this.get('part.count')>0;
	}),
	hasHidden: Ember.computed('part.displayedCount', 'part.count', function(){
		return this.get('part.count')>this.get('part.displayedCount');
	}),
	actions:{
		onInspectSelector(e){
			if(e.ctrlKey){
				let partSelector = this.get('part.selector');
				let fullSelector = this.get('part.fullSelector');
				let sourceEl = $('#source')[0];
				sourceEl.focus()
				sourceEl.setSelectionRange(fullSelector.length-partSelector.length, fullSelector.length);
			}
			else{
				let partElements = this.get('part.elements');
				if(partElements.length>0){
					for (var i = partElements.length - 1; i >= 0; i--) {
						partElements[i].set('isSelected', false);
					};
					partElements[0].set('isSelected', true);
					this.get('selectorInspector').inspect(this.get('part.fullSelectorObj'));
				}
				this.set('part.isSelected', true);
				this.get('onPartSelected')(this.get('part'));
			}
		},
		onSelectorMouseEnter(){
			this.get('selectorHighlighter').highlight(this.get('part.fullSelectorObj'));
		},
		onMouseLeave(){
			this.get('selectorHighlighter').removeHighlighting();
		},
		onRemovePart(){
			console.log('remove part: ' + this.get('part.fullSelector'));
		}
	}
});