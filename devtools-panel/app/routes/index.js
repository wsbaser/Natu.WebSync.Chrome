import Ember from 'ember';

export default Ember.Route.extend({
	vsclient: Ember.inject.service(),
	backgroundConnection: Ember.inject.service('background-connection'),
	// renderTemplate(){
	// 	this.render('current-page', { outlet: 'current-page' });
	// 	this.render('current-service', { outlet: 'current-service' });
	// 	this.render('content', { outlet: 'content' });
	// },
	model(){
		// this.get('backgroundConnection').connect();
		// var vsclient = this.get('vsclient');
		// return vsclient.connect()
		// 	.then(()=>vsclient.requestSessionWeb())
		// 	.then(()=>this.store.peekAll('service'))
		// 	.catch(()=>this.store.peekAll('service'));
	},
	// redirect(model, transition){
	// 	if(localStorage.currentService){
	// 		this.transitionTo('service', model.findBy('id', localStorage.currentService));
	// 	}
	// 	else{
	// 		this.transitionTo('service', 'fake_service_id');
	// 	}
	// }
});