import Ember from 'ember';

export default Ember.Service.extend({
	highlightComponents(componentSelectors){
		let json = JSON.stringify(componentSelectors);
		let x = "highlightComponents(`" + json +"`)";
		console.log(x);
		this._callEval(x);
	},
	highlight(selector){
		if(!selector){
			return;
		}
		if(selector.inspected){
			this.highlightInspectedElement(selector.childIndicesChain);
		}else if(selector.css){
			this.highlightCss(selector.css, selector.iframeIndex, selector.elementIndex, selector.childIndicesChain);
		}else if(selector.xpath){
			this.highlightXpath(selector.xpath, selector.iframeIndex, selector.elementIndex, selector.childIndicesChain);
		}else{
			throw Error('invalid selector');
		}
	},
	loadChildren(selector, onLoaded){
		if(!selector){
			return;
		}
		if(selector.inspected){
			this._callEval('loadChildrenForInspectedElement()', onLoaded);
		}else if(selector.css){
			this._callEval('loadChildren(`' + selector.css + '`, false' + ',' + selector.iframeIndex + ',' + selector.elementIndex +')', onLoaded);
		}else if(selector.xpath){
			this._callEval('loadChildren(`' + selector.xpath + '`, true' + ',' + selector.iframeIndex + ',' + selector.elementIndex +')', onLoaded);
		}else{
			throw Error('invalid selector');
		}
	},
	highlightInspectedElement(childIndicesChain){
		childIndicesChain = childIndicesChain||[];
		this._callEval('highlightInspectedElement(`'+childIndicesChain.join(',')+'`)');
	},
	highlightCss(css, iframeIndex, elementIndex, childIndicesChain){
		childIndicesChain = childIndicesChain||[];
		this._callEval('highlightSelector(`' + css + '`, false' + ',' + iframeIndex + ',' + elementIndex + ',`'+ childIndicesChain.join(',') +'`)', this.onHighlighted);
	},
	highlightXpath(xpath, iframeIndex, elementIndex, childIndicesChain){
		childIndicesChain = childIndicesChain||[];
		this._callEval('highlightSelector(`' + xpath + '`, true' + ',' + iframeIndex + ',' + elementIndex + ',`'+ childIndicesChain.join(',')  +'`)', this.onHighlighted);
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
	removeComponentsHighlighting(){
		this._callEval('removeComponentsHighlighting()');
	},
	_callEval(script, callback){
	   	chrome.devtools.inspectedWindow.eval(script, { useContentScriptContext: true }, callback);
	}
});
