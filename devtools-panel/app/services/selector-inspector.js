import Ember from 'ember';

export default Ember.Service.extend({
	inspect(selector, iframeIndex, elementIndex){
		if(!selector){
			return;
		}
		if(selector.css){
			this._callEval('inspectCssSelector("' + selector.css + '",' + iframeIndex + ',' + elementIndex + ')');
		}
		else{
			this._callEval('inspectXpathSelector("' + selector.xpath + '",' + iframeIndex + ',' + elementIndex + ')');
		}
	},
	_callEval(script){
	   	chrome.devtools.inspectedWindow.eval(script, { useContentScriptContext: true });
	}
});
