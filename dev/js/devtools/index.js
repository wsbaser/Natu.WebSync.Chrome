'use strict';

// var port = chrome.runtime.connect({
// 	name: 'devtools-page:' + chrome.devtools.inspectedWindow.tabId
// });

// function send(name, data) {
// 	port.postMessage({
// 		name: name,
// 		data: data,
// 		tabId: chrome.devtools.inspectedWindow.tabId
// 	});
// }

// port.onMessage.addListener(function (message) {	
// 	switch (message.name) {
// 		case 'diff':
// 			resources.get(message.data.uri, function (res) {
// 				res && res.patch(message.data.patches);
// 			});
// 			break;
// 		case 'pending-patches':
// 			resources.applyPendingPatches(message.data);
// 			break;
// 		case 'get-stylesheets':
// 			resources.list(function (urls) {
// 				send('stylesheets', urls.filter(Boolean));
// 			});
// 			break;
// 		case 'get-stylesheet-content':
// 			resources.get(message.data.url, function (res) {
// 				send('stylesheet-content', {
// 					content: res ? res.content : null
// 				});
// 			});
// 			break;
// 		case 'reset':
// 			resources.reset();
// 			break;
// 		default:
// 			console.log('Devtools received invalid message', message);
// 			break;
// 	}
// });

// // DevTools page -- devtools.js
// // Create a connection to the background page
// var backgroundPageConnection = chrome.runtime.connect({
//     name: "devtools-page"
// });

// backgroundPageConnection.onMessage.addListener(function (message) {
//     // Handle responses from the background page, if any
// });

// console.log("Post message to background.")

// backgroundPageConnection.postMessage({
//     tabId: chrome.devtools.inspectedWindow.tabId,
//     scriptToInject: "assets/content.js"
// });

// chrome.runtime.sendMessage({
// 		name: "injectContentScript",
// 		tabId: chrome.devtools.inspectedWindow.tabId
// 	}, onScriptsInjected);

// function onScriptsInjected(){
	chrome.devtools.panels.create('WebSync', 'icons/icon64.png', 'devtools-panel.html');
	chrome.devtools.panels.elements.createSidebarPane("WebSync",
		function(sidebar) {
		  sidebar.setPage("devtools-panel.html");
		  sidebar.onHidden.addListener(handleHidden)
		});
// };

function handleHidden() {
	chrome.devtools.inspectedWindow.eval('removeHighlighting()', { useContentScriptContext: true });
	chrome.devtools.inspectedWindow.eval('removeComponentsHighlighting()', { useContentScriptContext: true });
}