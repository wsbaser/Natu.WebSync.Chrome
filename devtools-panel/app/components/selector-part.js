import Ember from 'ember';

export default Ember.Component.extend({
	tagName: 'span',
	classNames: ['part'],
	classNameBindings:['isExist:exist', 'isSeveral:several', 'hasHidden:hidden'],
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
	executeContentScript(script){
	   	chrome.devtools.inspectedWindow.eval(script, { useContentScriptContext: true });
	},
	removeHighlighting(){
		this.executeContentScript('removeHighlighting()');
	},
	highlightSelector(iframeIndex, elementIndex){
		let script = 'highlightSelector("' + this.get('part.fullSelector') + '",' + this.get('isXPath') + ',' + iframeIndex + ',' + elementIndex +')';
		this.executeContentScript(script);
	},
	inspectSelector(iframeIndex, elementIndex){
		let scriptToInspectSelector = 
			this.get('isXPath')?
			'inspectXpathSelector("' + this.get('part.fullSelector') + '",' + iframeIndex + ',' + elementIndex + ')':
			'inspectCssSelector("' + this.get('part.fullSelector') + '",' + iframeIndex + ',' + elementIndex + ')';
	   	chrome.devtools.inspectedWindow.eval(
	      scriptToInspectSelector,
	      { useContentScriptContext: true });
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
		},
		onInspectElement(element){
			this.inspectSelector(element.get('iframeIndex'), element.get('elementIndex'));
		},
		onSelectorMouseEnter(){
			this.highlightSelector();
		},
		onElementMouseEnter(element){
			this.highlightSelector(element.get('iframeIndex'), element.get('elementIndex'));
		},
		onMouseLeave(){
			this.removeHighlighting();
		}
	}
});