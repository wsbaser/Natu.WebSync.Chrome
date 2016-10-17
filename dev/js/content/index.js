console.log('WebSync content script injected');

window.evaluateXpath = function find(xpath) {
    if(!xpath){
    	return [];
    }
	return evaluteSelectorInAllIframes(xpath, function(selector, rootElement){
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

function evaluteSelectorInAllIframes(selector, evaluateFunc){
	var result = {};
	result[""] = evaluateFunc(document, selector);
	document.querySelectorAll('iframe').forEach(function(iframeNode){
		result[iframeNode.src] = evaluateFunc(iframeNode.contentDocument, selector);
	});
	return result;
}

window.evaluateCss = function find(css) {
	if(!css){
		return {};
	}
	return evaluteSelectorInAllIframes(css, function(rootElement,selector){
		return Array.from(rootElement.querySelectorAll(selector));
	});
};