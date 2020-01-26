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


var connections = {};

chrome.runtime.onConnect.addListener(function (port) {
	console.log('Devtools Page connected.');
    var extensionListener = function (message, sender, sendResponse) {
		console.log('Received message from Devtools Page for tab ' + message.tabId + '.');
        // The original connection event doesn't include the tab ID of the
        // DevTools page, so we need to send it explicitly.
        if (message.name == "init") {
          connections[message.tabId] = port;
          return;
        }

	// other message handling
    }

    // Listen to messages sent from the DevTools page
    port.onMessage.addListener(extensionListener);

    port.onDisconnect.addListener(function(port) {
    	console.log('Devtools Page disconnected.');
        port.onMessage.removeListener(extensionListener);

        var tabs = Object.keys(connections);
        for (var i=0, len=tabs.length; i < len; i++) {
          if (connections[tabs[i]] == port) {
            delete connections[tabs[i]]
            break;
          }
        }
    });
});

// Receive message from content script and relay to the devTools page for the
// current tab
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log('Received message from Content Page.');
    // Messages from content scripts should have sender.tab set
    if (sender.tab) {
      var tabId = sender.tab.id;
      if (tabId in connections) {
        connections[tabId].postMessage(request);
        console.log('Sent message to Devtools Page for tab ' + tabId+'.');
      } else {
        console.log("Tab not found in connection list.");
      }
    } else {
      console.log("sender.tab not defined.");
    }
    return true;
});

// Check whether new version is installed
chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        console.log("This is a first install!");
        chrome.tabs.create({url:"update.html"});
    }else if(details.reason == "update"){
        let thisVersion = chrome.runtime.getManifest().version;
        let thisMajorVersion = thisVersion.split('.')[0];
        let previousMajorVersion = details.previousVersion.split('.')[0];
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
        if(previousMajorVersion==0 && thisMajorVersion==1){
          chrome.tabs.create({url:"update.html"});
        }
    }
});