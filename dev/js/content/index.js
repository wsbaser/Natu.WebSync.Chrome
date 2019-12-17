console.log('WebSync content script injected');

// document.addEventListener("DOMContentLoaded", function(){
// 	chrome.runtime.sendMessage({
// 		type: "urlchanged",
// 		location: window.location
// 	});
// });

// window.onload = window.onUrlChanged;
// window.onhashchange = window.onUrlChanged;

// function onUrlChanged(){
// 	chrome.runtime.sendMessage({
// 		type: "urlchanged",
// 		data: {
// 			url: window.location.href
// 		}
// 	});
// 	console.log("Sent urlchanged message to Backround Page.");
// }

window.getCurrentUrl = function(){
	return window.location;
}

window.getIframes = function(){
	return document.querySelectorAll('iframe');
}

function evaluteSelectorInAllIframes(selector, evaluateFunc){
	var result = [];
	result.push({
		documentNode:document,
		elements: evaluateFunc(document, selector)
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

function serializeElements(iframeData){
	for (var i = iframeData.length - 1; i >= 0; i--) {
		iframeData[i].elements = iframeData[i].elements.map(e=>{
			return {
				domElement: e,
				isInspected: e===$0,
				tagName: e.tagName,
				id: e.id,
				name: e.name,
				classNames: Array.from(e.classList),
				innerText: getFirstLevelText(e),
				displayed: e.style.display!=='none',
				containsTags: e.innerHTML.indexOf('<') != -1
			};
		});
	};
	return iframeData;
}

function getFirstLevelText(e){
	var firstText = "";
	for (var i = 0; i < e.childNodes.length; i++) {
	    var curNode = e.childNodes[i];
	    if (curNode.nodeType === Node.TEXT_NODE) {
	        firstText += curNode.nodeValue;
	    }
	}
	return firstText.trim();
}

window.locateInspectedElement = function(cssSelectors, xpathSelectors){
	let partIndex=-1;
	let partElements;
	let isXpathElements;
	let blankPartIndex=-1;
	let blankPartElements;
	let inspectedElement = $0;

	let maxLength = Math.max(cssSelectors.length, xpathSelectors.length);
	if(maxLength){
		// find out if inspected element belongs to any of current selector parts
		let partsElements = [];
		for (var i = 0; i < maxLength; i++) {
			partsElements.push({
				css: null,
				xpath: null
			});
			if(cssSelectors[i]){
				partsElements[i].css = evaluateCss(cssSelectors[i]);
				if(getElementIndex(partsElements[i].css, inspectedElement)!=-1){
					partIndex=i;
					partElements = partsElements[i].css;
					isXpathElements = false;
					break;
				}
			}
			if(xpathSelectors[i]){
				partsElements[i].xpath = evaluateXpath(xpathSelectors[i]);
				if(getElementIndex(partsElements[i].xpath, inspectedElement)!=-1){
					partIndex=i;
					partElements = partsElements[i].xpath;
					isXpathElements = true;
					break;
				}
			}
		}

		if(partIndex==-1){
			// inspected element does not belong to any of the current selector parts
			// we should find a location for the blank part
			blankPartIndex = getBlankPartIndex(partsElements, inspectedElement);
		}
	}else{
		// selector has no parts, so blank part will be the first one
		blankPartIndex=0;
	}

	// we gonna create a blank part, so will need inspected element data
	if(blankPartIndex!=-1){
		blankPartElements = serializeElements([{
			documentNode: getDocumentOf(inspectedElement),
			elements: [inspectedElement]
		}]);
	}

	return {
		partIndex: partIndex,
		partElements: partElements,
		isXpathElements: isXpathElements,
		blankPartIndex: blankPartIndex,
		blankPartElements: blankPartElements
	};
}

window.getBlankPartIndex = function(partsElements, blankPartElement){
	return getElementPartIndex(partsElements, blankPartElement.parentNode) + 1;
}

window.getElementPartIndex = function(partsElements, element){
	if(!element){
		return -1;
	}
	for (var i = partsElements.length - 1; i >= 0; i--) {
		if(partsElements[i].css && getElementIndex(partsElements[i].css, element)!=-1){
			return i;
		}
		if(partsElements[i].xpath && getElementIndex(partsElements[i].xpath, element)!=-1){
			return i;
		}
	}
	return getElementPartIndex(partsElements, element.parentNode);
}

window.getElementIndex = function(iframeData, element){
	let elementIndex=0;
	for (var i = 0; i<iframeData.length ; i++ ) {
		for (var j = 0; j < iframeData[i].elements.length; j++) {
			if(iframeData[i].elements[j].domElement==element){
				return elementIndex;
			}
			elementIndex++;
		};
	};
	return -1;
}

window.getDocumentOf = function(element){
	if(element.parentNode){
		return getDocumentOf(element.parentNode);
	}
	return element;
}

window.evaluateXpath = function find(xpath) {
    if(!xpath){
    	return [];
    }
	return serializeElements(evaluteSelectorInAllIframes(xpath, function(rootElement, selector){
	    var result = [];
	    var nodes = document.evaluate(selector, rootElement, null, XPathResult.ANY_TYPE, null);
	    var currentNode = nodes.iterateNext();
	    while (currentNode) {
	        result.push(currentNode);
	        currentNode = nodes.iterateNext();
	    }
	    return result;
	}));
};

window.evaluateCss = function find(css) {
	if(!css){
		return {};
	}
	return serializeElements(evaluteSelectorInAllIframes(css, function(rootElement,selector){
		return Array.from(rootElement.querySelectorAll(selector));
	}));
};

window.evaluateSelector = function(selector, isXpath){
	return isXpath?evaluateXpath(selector):evaluateCss(selector);
};

function inspectElement(iframeDataList, iframeIndex, elementIndex){
	if(iframeIndex !=undefined && elementIndex!=undefined){
		if(iframeDataList[iframeIndex]){
			var iframeData = iframeDataList[iframeIndex];
			if(iframeData){
				let element = iframeData.elements[elementIndex];
				element.domElement.scrollIntoViewIfNeeded();
				inspect(element.domElement);
			}
		}
		else{
			console.log('No element for specified iframeIndex and elementIndex: ' + iframeIndex + ', ' + elementIndex);
		}
	}else{
		// inspect 
		var arr = [].concat.apply([], iframeDataList.map(function(iframeData){return iframeData.elements;}));
		let element = arr[0];
		if(element){
			if(element.domElement!=$0){
				element.domElement.scrollIntoViewIfNeeded();
				inspect(element.domElement);
			}
		}
		else{
			console.log('No elements to inspect.');
		}
	}
};

window.inspectXpathSelector = function(xpath, iframeIndex, elementIndex){
	inspectElement(evaluateXpath(xpath), iframeIndex, elementIndex);
};

window.inspectCssSelector = function(css, iframeIndex, elementIndex){
	inspectElement(evaluateCss(css), iframeIndex, elementIndex);
};

window.createHighlighterElement = function(documentNode, clientRect, highlightColor){
	var highlighterElement = documentNode.createElement('div');
	highlighterElement.classList.add('websync-highlighter');
	highlighterElement.style.left = (documentNode.scrollingElement.scrollLeft + clientRect.left) + 'px';
	highlighterElement.style.top = (documentNode.scrollingElement.scrollTop + clientRect.top) +'px';
	highlighterElement.style.width = clientRect.width+'px';
	highlighterElement.style.height = clientRect.height+'px';
	highlighterElement.style.position = 'absolute';
	highlighterElement.style.backgroundColor = highlightColor;
	highlighterElement.style.border = '1px solid red';
	highlighterElement.style.opacity = 0.5;
	highlighterElement.style.zIndex = '999999999999999999999999999999999999999999999999999999999999999';
	let bodyElement = documentNode.documentElement.querySelector('body');
	bodyElement.appendChild(highlighterElement);
};

window.higlightElement = function(documentNode, element, highlightColor){
	let clientRects = Array.from(element.getClientRects());
	clientRects.forEach((clientRect)=>{
		createHighlighterElement(documentNode, clientRect, highlightColor);
	});
}

window.hightlightElementsInIframe = function(iframeNode, iframeElements, highlightColor){
	if(iframeElements[0]){
		// .scroll to first
		iframeElements[0].domElement.scrollIntoViewIfNeeded();
		// iframeElements[0].scrollIntoView({
		//   	behavior: "smooth",
		//     block:   "end"
		// });
	}
	iframeElements.forEach((iframeElement)=>{
		higlightElement(iframeNode, iframeElement.domElement, highlightColor);
	});
};

window.HL_GREEN = "rgb(50, 205, 50,0.7)";
window.HL_YELLOW = "yellow";

window.highlightInspectedElement = function(){
	removeHighlighting();
	higlightElement(document, $0, window.HL_GREEN);
};

window.highlightSelector = function(selector, isXpath, iframeIndex, elementIndex){
	removeHighlighting();

	var iframeDataList = evaluateSelector(selector, isXpath);

	let elementsCount = iframeDataList.reduce(function(prev, id) {return prev + id.elements.length;}, 0);
	if(!elementsCount){
		return;
	}

	let highlightColor = elementsCount==1?HL_GREEN:HL_YELLOW;

	if(iframeIndex !=undefined && elementIndex!=undefined){
		if(iframeDataList[iframeIndex]){
			var iframeData = iframeDataList[iframeIndex];
			if(iframeData){
				hightlightElementsInIframe(iframeData.documentNode, [iframeData.elements[elementIndex]], highlightColor);
			}
		}
		else{
			console.log('No element for specified iframeIndex and elementIndex: ' + iframeIndex + ', ' + elementIndex);
		}
	}
	else{
		iframeDataList.forEach((iframeData)=>{
			hightlightElementsInIframe(iframeData.documentNode, iframeData.elements, highlightColor);
		});
	}
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
