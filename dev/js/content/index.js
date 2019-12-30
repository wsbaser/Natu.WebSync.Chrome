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
	let iframes = document.querySelectorAll('iframe');
	let validIframes = [];
	iframes.forEach(function(iframeNode){
		try{
			if(iframeNode.contentDocument){
				validIframes.push(iframeNode);
			}
		}
		catch(err){
			// We can't access contendDocument from iFrame with different origin,
			// and it is OK.
		}
	});
	return validIframes;
}

function evaluteSelectorInAllIframes(selector, evaluateFunc){
	var result = [];
	result.push({
		documentNode: document,
		elements: evaluateFunc(document, selector)
	});
	getIframes().forEach(function(iframeNode){
		result.push({
			documentNode: iframeNode.contentDocument,
			elements: evaluateFunc(iframeNode.contentDocument, selector)
		});
	});
	return result;
}

function serializeElements(elements){
	return elements.map(e=>{
		return {
			domElement: e,
			isInspected: e===$0,
			tagName: e.tagName,
			id: e.id,
			name: e.name,
			classNames: Array.from(e.classList),
			innerText: getFirstLevelText(e),
			displayed: getIsDisplayed(e),
			containsTags: e.innerHTML.indexOf('<') != -1,
			hasChildren: !!e.children.length
		};
	});
}

function serializeiFrames(iframeData){
	for (var i = iframeData.length - 1; i >= 0; i--) {
		iframeData[i].elements = serializeElements(iframeData[i].elements);
	};
	return iframeData;
}

function getIsDisplayed(element){
	return !!( element.offsetWidth || element.offsetHeight || element.getClientRects().length );
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
		blankPartElements = serializeiFrames([{
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
    var start = performance.now();
	var result = serializeiFrames(evaluteSelectorInAllIframes(xpath, function(rootElement, selector){
	    var result = [];
	    var nodes = document.evaluate(selector, rootElement, null, XPathResult.ANY_TYPE, null);
	    var currentNode = nodes.iterateNext();
	    while (currentNode) {
	        result.push(currentNode);
	        currentNode = nodes.iterateNext();
	    }
	    return result;
	}));
	result[0].timeStatus = xpath + ": " + (performance.now()-start) + " ms.";
	return result;
};

window.evaluateCss = function find(css) {
	if(!css){
		return {};
	}
	var start = performance.now();
	var result = serializeiFrames(evaluteSelectorInAllIframes(css, function(rootElement,selector){
		return Array.from(rootElement.querySelectorAll(selector));
	}));

	result[0].timeStatus = css + ": " + (performance.now()-start) + " ms.";
	return result;
};

window.evaluateSelector = function(selector, isXpath){
	return isXpath?evaluateXpath(selector):evaluateCss(selector);
};

window.locateChild = function(element, childIndicesChain){
	childIndicesChain = childIndicesChain.split(',');
	for (var i = 0; i<childIndicesChain.length;i++) {
		let childIndex = childIndicesChain[i];
		element=element.children[childIndex];
		if(!element){
			return null;
		}
	};
	return element;
};

window.loadChildrenForInspectedElement = function(){
	return loadChildrenForElement($0);
};

window.loadChildren = function(selector, isXpath, iframeIndex, elementIndex){
	var iframeDataList = evaluateSelector(selector, isXpath);

	var iframeData = iframeDataList[iframeIndex];
	if(!iframeData){
		console.log('No element for specified iframeIndex: ' + iframeIndex);
	}

	let element = iframeData.elements[elementIndex];
	if(!element){
		console.log('No element for specified elementIndex: ' + elementIndex);
	}
	return loadChildrenForElement(element.domElement);
};

window.loadChildrenForElement = function(element){
	var result = serializeElements(Array.from(element.children));
	for (var i = element.children.length - 1; i >= 0; i--) {
		result[i].children = loadChildrenForElement(element.children[i]);
	};
	return result;
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
	highlighterElement.style.border = '3px dashed firebrick';
	highlighterElement.style.opacity = 0.5;
	highlighterElement.style.boxSizing = 'border-box';
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
		iframeElements[0].scrollIntoViewIfNeeded();
		// iframeElements[0].scrollIntoView({
		//   	behavior: "smooth",
		//     block:   "end"
		// });
	}
	iframeElements.forEach((iframeElement)=>{
		higlightElement(iframeNode, iframeElement, highlightColor);
	});
};

window.HL_GREEN = "rgb(207, 232, 252)";
window.HL_YELLOW = "rgb(207, 232, 252)";

window.highlightInspectedElement = function(childIndicesChain){
	removeHighlighting();
	let element = $0;
	if(childIndicesChain){
		element = locateChild(element, childIndicesChain);
		if(!element){
			console.log('Element not found. ' + childIndicesChain);
			return;
		}		
	}
	higlightElement(document, element, window.HL_GREEN);
};

window.highlightSelector = function(selector, isXpath, iframeIndex, elementIndex, childIndicesChain){
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
			if(!iframeData){
				console.log('Iframe not found. ' + selector + ', ' + iframeIndex);
				return;
			}
			let element = iframeData.elements[elementIndex].domElement;
			if(childIndicesChain){
				element = locateChild(element, childIndicesChain);
				if(!element){
					console.log('Element not found. ' + selector + ', ' + childIndicesChain);
					return;
				}
			}

			hightlightElementsInIframe(iframeData.documentNode, [element], highlightColor);
		}
		else{
			console.log('No element for specified iframeIndex and elementIndex: ' + iframeIndex + ', ' + elementIndex);
		}
	}
	else{
		iframeDataList.forEach((iframeData)=>{
			hightlightElementsInIframe(iframeData.documentNode, iframeData.elements.map(e=>e.domElement), highlightColor);
		});
	}
};

window.removeHighlightingInIframe = function(iframeNode){
	if(!iframeNode){
		return;
	}
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
