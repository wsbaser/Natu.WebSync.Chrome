import Ember from 'ember';

export default Ember.Component.extend({
	tagName: 'span',
	classNames: ['part'],
	classNameBindings:['isExist:exist', 'isSeveral:several', 'hasHidden:hidden'],
	count: 0,
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
	mouseEnter(){
		console.log('Mouse over');
		this.highlightSelector();
	},
	mouseLeave(){
		console.log('Mouse leave');
		this.removeHighlighting();
	},
	removeHighlighting(){
		this.executeContentScript('removeHighlighting()');
	},
	highlightSelector(){
		let script = 'highlightSelector("' + this.get('part.fullSelector') + '",' + this.get('isXPath') + ')';
		this.executeContentScript(script);
	},
	inspectSelector(){
		let scriptToInspectSelector = 
			this.get('isXPath')?
			'inspectXpathSelector("' + this.get('part.fullSelector') + '")':
			'inspectCssSelector("' + this.get('part.fullSelector') + '")';
	   	chrome.devtools.inspectedWindow.eval(
	      scriptToInspectSelector,
	      { useContentScriptContext: true });
	},
	actions:{
		onInspectSelector(selectorNode){
			this.inspectSelector();
		}
	}
});