console.log('WebSync content script injected');

window.getIframes = function(){
	return document.querySelectorAll('iframe');
}

function evaluteSelectorInAllIframes(selector, evaluateFunc){
	var result = [];
	result.push({
		documentNode:document,
		elements:evaluateFunc(document, selector)
	});
	getIframes().forEach(function(iframeNode){
		try{
			result.push({
				documentNode: iframeNode.contentDocument,
				elements: evaluateFunc(iframeNode.contentDocument, selector)
			});
		}
		catch(err){
			// We can't access contendDocument from iFrame with different origin,
			// and it is OK.
		}
	});
	return result;
}

window.evaluateXpath = function find(xpath) {
    if(!xpath){
    	return [];
    }
	return evaluteSelectorInAllIframes(xpath, function(rootElement, selector){
	    var result = [];
	    var nodes = document.evaluate(selector, rootElement, null, XPathResult.ANY_TYPE, null);
	    var currentNode = nodes.iterateNext();
	    while (currentNode) {
	        result.push(currentNode);
	        currentNode = nodes.iterateNext();
	    }
	    return result;
	});
};

window.evaluateCss = function find(css) {
	if(!css){
		return {};
	}
	return evaluteSelectorInAllIframes(css, function(rootElement,selector){
		return Array.from(rootElement.querySelectorAll(selector));
	});
};

window.evaluateSelector = function(selector, isXpath){
	return isXpath?evaluateXpath(selector):evaluateCss(selector);
};

function inspectElement(iframeDataList, index){
	index = index||0;
	var arr = [].concat.apply([], iframeDataList.map(function(iframeData){return iframeData.elements;}));
	inspect(arr[index]);
};

window.inspectXpathSelector = function(xpath,index){
	inspectElement(evaluateXpath(xpath),index);
};

window.inspectCssSelector = function(css,index){
	inspectElement(evaluateCss(css),index);
};

window.createHighlighterElement = function(documentNode,clientRect){
	var highlighterElement = documentNode.createElement('div');
	highlighterElement.classList.add('websync-highlighter');
	highlighterElement.style.left = clientRect.left+'px';
	highlighterElement.style.top = clientRect.top+'px';
	highlighterElement.style.width = clientRect.width+'px';
	highlighterElement.style.height = clientRect.height+'px';
	highlighterElement.style.position = 'absolute';
	highlighterElement.style.backgroundColor = 'yellow';
	highlighterElement.style.border = '1px solid red';
	highlighterElement.style.opacity = 0.5;
	let bodyElement = documentNode.documentElement.querySelector('body');
	bodyElement.appendChild(highlighterElement);
};

window.hightlightElementsInIframe = function(iframeNode, iframeElements){
	iframeElements.forEach((iframeElement)=>{
		let clientRects = Array.from(iframeElement.getClientRects());
		clientRects.forEach((clientRect)=>{
			createHighlighterElement(iframeNode, clientRect);
		});
	});
};

window.highlightSelector = function(selector,isXpath){
	var iframeDataList = evaluateSelector(selector, isXpath);
	iframeDataList.forEach((iframeData)=>{
		hightlightElementsInIframe(iframeData.documentNode, iframeData.elements);
	});
};

window.removeHighlightingInIframe = function(iframeNode){
	let highlighterElements = Array.from(iframeNode.querySelectorAll('.websync-highlighter'));
	highlighterElements.forEach(function(highlighterElement){
		highlighterElement.remove();
	});
};

window.removeHighlighting = function(){
	removeHighlightingInIframe(document);
	getIframes().forEach(function(iframeNode){
		removeHighlightingInIframe(iframeNode.contentDocument);
	});
};

window.getCurrentUrl=function(){
	return window.location;
}