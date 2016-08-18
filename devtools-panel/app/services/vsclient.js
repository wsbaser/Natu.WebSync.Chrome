import Ember from 'ember';

let SIMessageTypes = {
	SessionWebData: "SessionWebData",
	SessionWebRequest: "SessionWebRequest"
};

let SYNCHRONIZEIT_WS_URL = 'ws://localhost:18488/synchronize';

export default Ember.Service.extend({
	store: Ember.inject.service(),
	connect(){
		let webSocket = new WebSocket(SYNCHRONIZEIT_WS_URL);
		webSocket.onopen = this.onopen.bind(this);
		webSocket.onmessage = this.onmessage.bind(this);
		this.set('webSocket', webSocket);
	},
	onopen(){
		console.log('Socket is opened!');
		this.sendSessionWebRequest();
	},
	onmessage(event){
		console.log('Message received!');
		var message = this.parseMessage(event.data);
		if(message.Type===SIMessageTypes.SessionWebData){
			this.updateStore(message.Data);
		}else{
			console.error('Received message with invalid message type:',message);
		}
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
		return {
			Type: type,
			Data: data?JSON.stringify(data):''
		};
	},
	updateStore(data){
		this.get('store').pushPayload(data);
	}
});
