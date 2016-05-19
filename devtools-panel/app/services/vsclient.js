import Ember from 'ember';

export default Ember.Service.extend({
	connect(){
		let webSocket = new WebSocket('ws://localhost:18488/synchronize');
		webSocket.onopen = this.onopen;
		webSocket.onmessage = this.onmessage;
		this.set('webSocket', webSocket);
	},
	onopen(event){
		console.log('Socket is opened!');
	},
	onmessage(event){
		console.log('Message received!', event);
	},
	send(data){
		this.get('webSocket').send(JSON.stringify(data));
	}
});
