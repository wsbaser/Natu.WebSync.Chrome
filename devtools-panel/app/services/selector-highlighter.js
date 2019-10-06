import Ember from 'ember';

export default Ember.Service.extend({
	highlight(selector, iframeIndex, elementIndex){
		if(!selector){
			return;
		}
		if(selector.css){
			this.highlightCss(selector.css, iframeIndex, elementIndex);
		}
		else{
			this.highlightXpath(selector.xpath, iframeIndex, elementIndex);
		}
	},
	highlightCss(css, iframeIndex, elementIndex){
		this._callEval('highlightSelector("' + css + '", false' + ',' + iframeIndex + ',' + elementIndex +')');
	},
	highlightXpath(xpath, iframeIndex, elementIndex){
		this._callEval('highlightSelector("' + xpath + '", true' + ',' + iframeIndex + ',' + elementIndex +')');
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
