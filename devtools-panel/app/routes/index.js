import Ember from 'ember';

export default Ember.Route.extend({
	vsclient: Ember.inject.service('vsclient'),
	backgroundConnection: Ember.inject.service('background-connection'),
	// renderTemplate(){
	// 	this.render('current-page', { outlet: 'current-page' });
	// 	this.render('current-service', { outlet: 'current-service' });
	// 	this.render('content', { outlet: 'content' });
	// },
	model(){
		var backgroundConnection = this.get('backgroundConnection');
		backgroundConnection.connect();
		var vsclient = this.get('vsclient');
		return vsclient.connect()
			.then(()=>vsclient.requestSessionWeb())
			.then(()=>this.store.peekAll('service'))
			.catch(()=>this.store.peekAll('service'));
	},
	redirect(model, transition){
		this.transitionTo('service', model.findBy('id', localStorage.currentService));
	}
});