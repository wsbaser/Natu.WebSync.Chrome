import Ember from 'ember';

export default Ember.Service.extend({
	inspect(selector){
		if(!selector){
			return;
		}
		if(selector.css){
			this.inspectCss(selector.css, selector.iframeIndex, selector.elementIndex);
		}
		else{
			this.inspectXpath(selector.xpath, selector.iframeIndex, selector.elementIndex);
		}
	},
	inspectCss(css, iframeIndex, elementIndex){
		this._callEval('inspectCssSelector("' + css + '",' + iframeIndex + ',' + elementIndex + ')');
	},
	inspectXpath(xpath, iframeIndex, elementIndex){
		this._callEval('inspectXpathSelector("' + xpath + '",' + iframeIndex + ',' + elementIndex + ')');
	},
	_callEval(script){
	   	chrome.devtools.inspectedWindow.eval(script, { useContentScriptContext: true });
	}
});