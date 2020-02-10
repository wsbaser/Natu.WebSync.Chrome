import Ember from 'ember';

export default Ember.Service.extend({
	inspect(selector){
		if(!selector){
			return;
		}
		if(selector.inspected){
			this.inspectInspectedChild(selector.childIndicesChain);
		}
		else if(selector.css){
			this.inspectCss(selector.css, selector.iframeIndex, selector.elementIndex, selector.childIndicesChain);
		}
		else if(selector.xpath){
			this.inspectXpath(selector.xpath, selector.iframeIndex, selector.elementIndex, selector.childIndicesChain);
		}else{
			throw Error('invalid selector');
		}
	},
	inspectInspectedChild(childIndicesChain){
		this._callEval('inspectInspectedChild(`' + (childIndicesChain||[]).join(',') + '`)');
	},
	inspectCss(css, iframeIndex, elementIndex, childIndicesChain){
		this._callEval('inspectCssSelector(`' + css + '`,' + iframeIndex + ',' + elementIndex + ',`' + (childIndicesChain||[]).join(',') + '`)');
	},
	inspectXpath(xpath, iframeIndex, elementIndex, childIndicesChain){
		this._callEval('inspectXpathSelector(`' + xpath + '`,' + iframeIndex + ',' + elementIndex + ',`' + (childIndicesChain||[]).join(',') + '`)');
	},
	_callEval(script){
	   	chrome.devtools.inspectedWindow.eval(script, { useContentScriptContext: true });
	}
});