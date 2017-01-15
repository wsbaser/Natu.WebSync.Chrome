console.log('WebSync content script injected');

function evaluteSelectorInAllIframes(selector, evaluateFunc){
	var result = {};
	result[""] = evaluateFunc(document, selector);
	document.querySelectorAll('iframe').forEach(function(iframeNode){
		result[iframeNode.src] = evaluateFunc(iframeNode.contentDocument, selector);
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

function inspectElement(elements, index){
	index = index||0;
	var arr = [].concat.apply([], Object.values(elements));
	inspect(arr[index]);
};

window.inspectXpathSelector = function(xpath,index){
	inspectElement(evaluateXpath(xpath),index);
};

window.inspectCssSelector = function(css,index){
	inspectElement(evaluateCss(css),index);
};