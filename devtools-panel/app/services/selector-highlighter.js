import Ember from 'ember';

export default Ember.Service.extend({
	highlight(selector){
		this._callEval('highlightSelector("' + selector + '", false)');
	},
	removeHighlighting(){
		this._callEval('removeHighlighting()');
	},
	_callEval(script){
	   	chrome.devtools.inspectedWindow.eval(script, { useContentScriptContext: true });
	}
});
