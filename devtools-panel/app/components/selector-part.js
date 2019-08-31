import Ember from 'ember';

export default Ember.Component.extend({
	tagName: 'span',
	classNames: ['part'],
	classNameBindings:['isExist:exist', 'isSeveral:several', 'hasHidden:hidden'],
	selectorHighlighter: Ember.inject.service(),
	selectorInspector: Ember.inject.service(),
	isXPath:false,
	isSeveral: Ember.computed('part.count', function(){
		return this.get('part.count')>1;
	}),
	isExist: Ember.computed('part.count', function(){
		return this.get('part.count')>0;
	}),
	hasHidden: Ember.computed('part.displayedCount', 'part.count', function(){
		return this.get('part.count')>this.get('part.displayedCount');
	}),
	highlightSelector(iframeIndex, elementIndex){
		this.get('selectorHighlighter').highlight(this.get('part.fullSelectorObj'), iframeIndex, elementIndex);
	},
	inspectSelector(iframeIndex, elementIndex){
		this.get('selectorInspector').inspect(this.get('part.fullSelectorObj'), iframeIndex, elementIndex);
	},
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
				this.inspectSelector();
			}
			this.get('onPartSelected')(this.get('part'));
		},
		onSelectorMouseEnter(){
			this.highlightSelector();
		},
		// onInspectElement(element){
		// 	this.inspectSelector(element.get('iframeIndex'), element.get('elementIndex'));
		// },
		// onElementMouseEnter(element){
		// 	this.highlightSelector(element.get('iframeIndex'), element.get('elementIndex'));
		// },
		onMouseLeave(){
			this.get('selectorHighlighter').removeHighlighting();
		}
	}
});