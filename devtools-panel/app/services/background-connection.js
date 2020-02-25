import Ember from 'ember';

let connection = Ember.Service.extend({
	connect(){    
		var port = chrome.runtime.connect({name: "devtools-panel"});
		this.set('port', port);
		
		// Add the eval'd response to the console when the background page sends it back
		port.onMessage.addListener(this.messageReceived.bind(this));
		// . I do not remember why we need this timeout =|
		setTimeout(this.initConnection.bind(this), 500);
	},
	initConnection(){
		this.send('init');
	},
	send(name, data){
		this.get('port').postMessage({
			name: name,
			data: data,
			tabId: chrome.devtools.inspectedWindow.tabId
		});
	},
	messageReceived(message, sender, sendResponse){
		this.trigger(message.type, message.data);
	}
	// triggerEvent(msg){
	// 	console.log("Message from Background Page received.")
	// 	this.trigger(msg.type, msg.data);
	// }
});

connection.reopen(Ember.Evented);

export default connection;