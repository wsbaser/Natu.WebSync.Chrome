import Ember from 'ember';

export default Ember.Service.extend({
	highlight(selector){
		if(!selector){
			return;
		}
		if(selector.css){
			this._callEval('highlightSelector("' + selector.css + '", false)');
		}
		else{
			this._callEval('highlightSelector("' + selector.xpath + '", true)');
		}
	},
	highlightAll(selectors){
		selectors.forEach(s=>this.highlight(s));
	},
	removeHighlighting(){
		this._callEval('removeHighlighting()');
	},
	_callEval(script){
	   	chrome.devtools.inspectedWindow.eval(script, { useContentScriptContext: true });
	}
});
