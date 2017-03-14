import Ember from 'ember';
import ENV from 'devtools-panel/config/environment';

let SIMessageTypes = {
	SessionWebData: "SessionWebData",
	SessionWebRequest: "SessionWebRequest",
	ConvertSelector: "ConvertSelector",
	ConvertedSelector: "ConvertedSelector"
};

var service = Ember.Service.extend({
	store: Ember.inject.service(),
	isConnected: false,
	connect(){
		console.log("Trying to connect to WebSync on url: "+ENV.APP.WEBSYNC_WS_URL);
		let webSocket = new WebSocket(ENV.APP.WEBSYNC_WS_URL);
		webSocket.onopen = this.onopen.bind(this);
		webSocket.onmessage = this.onmessage.bind(this);
		webSocket.onclose = this.onclose.bind(this);
		this.set('webSocket', webSocket);
	},
	onclose(){
		this.set('isConnected', false);
	},
	onopen(){
		console.log('Connection to '+ENV.APP.WEBSYNC_WS_URL+' established succesfully!');
		this.set('isConnected', true);
		this.sendSessionWebRequest();
	},
	onmessage(event){
		console.log('Message received!');
		var message = this.parseMessage(event.data);
		if(message.Type===SIMessageTypes.SessionWebData){
			this.updateStore(message.Data);
		}else if(message.Type === SIMessageTypes.ConvertedSelector){
			this.trigger(SIMessageTypes.ConvertedSelector, message.Data);
		}
		else{
			console.error('Received message with invalid message type:',message);
		}
	},
	convertSelector(selector){
		this.send(this.createMessage(SIMessageTypes.ConvertSelector,selector));
	},
	sendSessionWebRequest(){
		this.send(this.createMessage(SIMessageTypes.SessionWebRequest));
	},
	sendSessionWeb(sessionWeb){
		this.send(this.createMessage(SIMessageTypes.SessionWebData, sessionWeb));
	},
	send(message){
		this.get('webSocket').send(JSON.stringify(message));
	},
	parseMessage(data){
		return JSON.parse(data);
	},
	createMessage(type, data){
		if(data){
			if(typeof data!=="string"){
				data = JSON.stringify(data);
			}
		}
		return {
			Type: type,
			Data: data
		};
	},
	updateStore(jsonData){
		var data = JSON.parse(jsonData);
		this.get('store').unloadAll();
		this.get('store').pushPayload(data);
		// TODO: create services in WebSync.VS
		var pageIds = this.get('store').peekAll('page-type').toArray().map(p=>p.id);
		if(pageIds.length>0){
			this.get('store').pushPayload({
				services: [{
					id: 'SpikeService',
					pages: pageIds
				}]
			});
		}
	}
});

service.reopen(Ember.Evented);

export default service;