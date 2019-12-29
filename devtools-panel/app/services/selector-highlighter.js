import Ember from 'ember';

export default Ember.Service.extend({
	highlight(selector){
		if(!selector){
			return;
		}
		if(selector.inspected){
			this.highlightInspectedElement();
		}if(selector.css){
			this.highlightCss(selector.css, selector.iframeIndex, selector.elementIndex, selector.childIndicesChain);
		}
		else if(selector.xpath){
			this.highlightXpath(selector.xpath, selector.iframeIndex, selector.elementIndex, selector.childIndicesChain);
		}else{
			throw Error('invalid selector');
		}
	},
	loadChildren(selector, onLoaded){
		if(!selector){
			return;
		}
		if(selector.css){
			this._callEval('loadChildren("' + selector.css + '", false' + ',' + iframeIndex + ',' + elementIndex +')', onLoaded);
		}
		else{
			this._callEval('loadChildren("' + selector.xpath + '", true' + ',' + iframeIndex + ',' + elementIndex +')', onLoaded);
		}
	},
	highlightInspectedElement(){
		this._callEval('highlightInspectedElement()');
	},
	highlightCss(css, iframeIndex, elementIndex, childIndicesChain){
		this._callEval('highlightSelector("' + css + '", false' + ',' + iframeIndex + ',' + elementIndex +')', this.onHighlighted);
	},
	highlightXpath(xpath, iframeIndex, elementIndex, childIndicesChain){
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
	_callEval(script, callback){
	   	chrome.devtools.inspectedWindow.eval(script, { useContentScriptContext: true }, callback);
	}
});
