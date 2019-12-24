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
	highlightInspectedElement(){
		this._callEval('highlightInspectedElement()');
	},
	highlightCss(css, iframeIndex, elementIndex){
		this._callEval('highlightSelector("' + css + '", false' + ',' + iframeIndex + ',' + elementIndex +')',this.onHighlighted);
	},
	highlightXpath(xpath, iframeIndex, elementIndex){
		this._callEval('highlightSelector("' + xpath + '", true' + ',' + iframeIndex + ',' + elementIndex +')', this.onHighlighted);
	},
	onHighlighted(result, exception){
		if(exception){
			console.log(exception);
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
