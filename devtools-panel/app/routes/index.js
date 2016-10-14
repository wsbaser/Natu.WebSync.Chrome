import Ember from 'ember';

export default Ember.Route.extend({
	// renderTemplate(){
	// 	this.render('current-page', { outlet: 'current-page' });
	// 	this.render('current-service', { outlet: 'current-service' });
	// 	this.render('content', { outlet: 'content' });
	// },
	beforeModel() {
    	this.transitionTo('convert');
	}
});