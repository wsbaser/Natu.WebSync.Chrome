console.log('WebSync content script injected');

// document.addEventListener("DOMContentLoaded", function(){
// 	chrome.runtime.sendMessage({
// 		type: "urlchanged",
// 		location: window.location
// 	});
// });

window.onload = window.onUrlChanged;
window.onhashchange = window.onUrlChanged;

function onUrlChanged(){
	chrome.runtime.sendMessage({
		type: "urlchanged",
		data: {
			url: window.location.href
		}
	});
	console.log("Sent urlchanged message to Backround Page.");
}

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
				tagName: e.tagName,
				id: e.id,
				name: e.name,
				className: e.className,
				innerText: e.innerText,
				displayed: e.style.display!=='none',
				containsTags: e.innerHTML.indexOf('<') != -1
			};
		});
	};
	return iframeData;
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
			element.domElement.scrollIntoViewIfNeeded();
			inspect(element.domElement);
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

window.createHighlighterElement = function(documentNode,clientRect){
	var highlighterElement = documentNode.createElement('div');
	highlighterElement.classList.add('websync-highlighter');
	highlighterElement.style.left = (documentNode.scrollingElement.scrollLeft + clientRect.left) + 'px';
	highlighterElement.style.top = (documentNode.scrollingElement.scrollTop + clientRect.top) +'px';
	highlighterElement.style.width = clientRect.width+'px';
	highlighterElement.style.height = clientRect.height+'px';
	highlighterElement.style.position = 'absolute';
	highlighterElement.style.backgroundColor = 'yellow';
	highlighterElement.style.border = '1px solid red';
	highlighterElement.style.opacity = 0.5;
	highlighterElement.style.zIndex = '999999999999999999999999999999999999999999999999999999999999999';
	let bodyElement = documentNode.documentElement.querySelector('body');
	bodyElement.appendChild(highlighterElement);
};

window.hightlightElementsInIframe = function(iframeNode, iframeElements){
	if(iframeElements[0]){
		// .scroll to first
		iframeElements[0].domElement.scrollIntoViewIfNeeded();
		// iframeElements[0].scrollIntoView({
		//   	behavior: "smooth",
		//     block:   "end"
		// });
	}
	iframeElements.forEach((iframeElement)=>{
		let clientRects = Array.from(iframeElement.domElement.getClientRects());
		clientRects.forEach((clientRect)=>{
			createHighlighterElement(iframeNode, clientRect);
		});
	});
};

window.highlightSelector = function(selector, isXpath, iframeIndex, elementIndex){
	var iframeDataList = evaluateSelector(selector, isXpath);
	if(iframeIndex !=undefined && elementIndex!=undefined){
		if(iframeDataList[iframeIndex]){
			var iframeData = iframeDataList[iframeIndex];
			if(iframeData){
				hightlightElementsInIframe(iframeData.documentNode, [iframeData.elements[elementIndex]]);
			}
		}
		else{
			console.log('No element for specified iframeIndex and elementIndex: ' + iframeIndex + ', ' + elementIndex);
		}
	}
	else{
		iframeDataList.forEach((iframeData)=>{
			hightlightElementsInIframe(iframeData.documentNode, iframeData.elements);
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