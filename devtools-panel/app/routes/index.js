import Ember from 'ember';

export default Ember.Route.extend({
	renderTemplate(){
		this.render('current-page', { outlet: 'current-page' });
		this.render('current-service', { outlet: 'current-service' });
		this.render('content', { outlet: 'content' });
	},
	redirect(model, transition){
		var currentService = model.findBy('id', localStorage.currentService);
		if(currentService){
			this.transitionTo('service', currentService);
		}
	}
});