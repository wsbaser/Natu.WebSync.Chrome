import Ember from 'ember';

let connection = Ember.Service.extend({
	connect(){    
		var port = chrome.runtime.connect({name: "devtools-panel"});
		
		// Add the eval'd response to the console when the background page sends it back
		port.onMessage.addListener(function (msg) {
			this.triggerEvent(msg);
		}.bind(this));

		setTimeout(function(){
			console.log("Post message to Background Page.");
			console.log("TabID:" + chrome.devtools.inspectedWindow.tabId);
			port.postMessage({
			    name: 'init',
			    tabId: chrome.devtools.inspectedWindow.tabId
			});
		}, 500);
	},
	triggerEvent(msg){
		console.log("Message from Background Page received.")
		this.trigger(msg.type, msg.data);
	}
});

connection.reopen(Ember.Evented);

export default connection;