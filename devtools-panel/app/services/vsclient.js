import Ember from 'ember';
import ENV from 'devtools-panel/config/environment';

let SIMessageTypes = {
	SessionWebData: "SessionWebData",
	SessionWebRequest: "SessionWebRequest",
	ConvertSelector: "ConvertSelector",
	ConvertedSelector: "ConvertedSelector",
	MatchUrl: "MatchUrl",
	UrlMatchResult: "UrlMatchResult"
};

var service = Ember.Service.extend({
	store: Ember.inject.service(),
	isConnected: false,
	requests:{},
	saveRequestPromise(requestId, resolve, reject){
		let requests = this.get('requests');
		requests[requestId] = {resolve, reject};
	},
	resolveRequestPromise(requestId, data){
		let requests = this.get('requests');
		let request = requests[requestId];
		if(request){
			request.resolve(data);
			delete requests[requestId];
		}
	},
	rejectRequestPromise(requestId,error){
		let requests = this.get('requests');
		let request = requests[requestId];
		if(request){
			request.reject(error);
			delete requests[requestId];
		}
	},
	connect(){
		return new Promise(function(resolve, reject){
			this.saveRequestPromise('connect', resolve, reject);
			console.log("Trying to connect to WebSync on url: "+ENV.APP.WEBSYNC_WS_URL);
			let webSocket = new WebSocket(ENV.APP.WEBSYNC_WS_URL);
			webSocket.onopen = this.onopen.bind(this);
			webSocket.onmessage = this.onmessage.bind(this);
			webSocket.onclose = this.onclose.bind(this);
			this.set('webSocket', webSocket);
		}.bind(this));
	},
	onclose(){
		this.rejectRequestPromise('connect');
		this.set('isConnected', false);
	},
	onopen(){
		console.log('Connection to ' + ENV.APP.WEBSYNC_WS_URL + ' established succesfully!');
		this.resolveRequestPromise('connect');
		this.set('isConnected', true);
		//this.sendSessionWebRequest();
	},
	onmessage(event){
		console.log('Message received!');
		var message = this.parseMessage(event.data);
		if(message.Type===SIMessageTypes.SessionWebData){
			this.updateStore(message.Data);
			this.trigger(SIMessageTypes.SessionWebData);
			this.resolveRequestPromise(SIMessageTypes.SessionWebRequest);
		}else if(message.Type === SIMessageTypes.ConvertedSelector){
			this.trigger(SIMessageTypes.ConvertedSelector, message.Data);
		}
		else if(message.Type === SIMessageTypes.UrlMatchResult){
			this.resolveRequestPromise(SIMessageTypes.MatchUrl, JSON.parse(message.Data));
		}
		else{
			console.error('Received message with invalid message type:',message);
		}
	},
	convertSelector(selector){
		return this.send(this.createMessage(SIMessageTypes.ConvertSelector,selector));
	},
	requestSessionWeb(){
		return this.send(this.createMessage(SIMessageTypes.SessionWebRequest));
	},
	sendSessionWeb(sessionWeb){
		return this.send(this.createMessage(SIMessageTypes.SessionWebData, sessionWeb));
	},
	matchUrl(url){
		return this.send(this.createMessage(SIMessageTypes.MatchUrl, url));
	},
	send(message){
		//let requestId = Math.random().toString(36).substr(2, 9);
		return new Promise(function(resolve, reject){
			this.get('webSocket').send(JSON.stringify(message));
			this.saveRequestPromise(message.Type,resolve,reject);
		}.bind(this));
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
		this.get('store').unloadAll();
		Ember.run(() => {
			var data = JSON.parse(jsonData);
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
		});
	}
});

service.reopen(Ember.Evented);

export default service;