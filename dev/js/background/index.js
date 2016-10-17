// console.log('Background script executed');
// // Background page -- background.js
// chrome.runtime.onConnect.addListener(function(devToolsConnection) {
//     console.log('DevTools page connected');
//     // assign the listener function to a variable so we can remove it later
//     var devToolsListener = function(message, sender, sendResponse) {
//         // Inject a content script into the identified tab
//         console.log("Received message from DevTools page.");
//         console.log(message);
//         chrome.tabs.executeScript(message.tabId,
//             { file: message.scriptToInject });
//     }
//     // add the listener
//     devToolsConnection.onMessage.addListener(devToolsListener);

//     devToolsConnection.onDisconnect.addListener(function() {
//          devToolsConnection.onMessage.removeListener(devToolsListener);
//     });
// });