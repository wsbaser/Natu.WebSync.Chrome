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
	highlightRootSelector(selector){
		if(selector.css){
			this._callEval('highlightRootSelector(`' + selector.css + '`, false)');
		}else if(selector.xpath){
			this._callEval('highlightRootSelector(`' + selector.xpath + '`, true)');
		}else{
			throw Error('invalid selector');
		}
	},
	removeRootHighlighting(selector){
		if(selector.css){
			this._callEval('removeRootHighlighting(`' + selector.css + '`, false)');
		}else if(selector.xpath){
			this._callEval('removeRootHighlighting(`' + selector.xpath + '`, true)');
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
		// this.sendMessage('highlightSelector', {
		// 		selectorType: 0,
		// 		selector: css,
		// 		iframeIndex: iframeIndex,
		// 		elementIndex: elementIndex,
		// 		childIndicesChain: childIndicesChain||[]
		// 	},
		// 	this.onHighlighted.bind(this));

		childIndicesChain = childIndicesChain||[];
		this._callEval('highlightSelector(`' + css + '`, false' + ',' + iframeIndex + ',' + elementIndex + ',`'+ childIndicesChain.join(',') +'`)', this.onHighlighted);
	},
	highlightXpath(xpath, iframeIndex, elementIndex, childIndicesChain){
		// this.sendMessage('highlightSelector', {
		// 		selectorType: 1,
		// 		selector: xpath,
		// 		iframeIndex: iframeIndex,
		// 		elementIndex: elementIndex,
		// 		childIndicesChain: childIndicesChain||[]
		// 	},
		// 	this.onHighlighted.bind(this));
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
	sendMessage(name, data, callback){
		chrome.runtime.sendMessage({
			name: name,
			data: data,
			tabId: chrome.devtools.inspectedWindow.tabId
		}, callback);
	},
	_callEval(script, callback){
	   	chrome.devtools.inspectedWindow.eval(script, { useContentScriptContext: true }, callback);
	}
});
