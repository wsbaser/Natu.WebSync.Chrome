import Ember from 'ember';

export default Ember.Route.extend({
	vsclient: Ember.inject.service('vsclient'),
	renderTemplate(){
		this.render('current-page', { outlet: 'current-page' });
		this.render('current-service', { outlet: 'current-service' });
		this.render('content', { outlet: 'content' });
	},
	model(){
		var vsclient = this.get('vsclient');
		return vsclient.connect()
			.then(()=>vsclient.requestSessionWeb())
			.then(()=>this.store.peekAll('service'))
			.catch(()=>this.store.peekAll('service'));
	},
	redirect(model, transition){
		var currentService = model.findBy('id', localStorage.currentService);
		if(!currentService && model.get('length')){
			currentService = model.get('firstObject');
		}
		if(currentService){
			this.transitionTo('service', currentService);
		}
	}
});