import Ember from 'ember';

export default Ember.Route.extend({
	renderTemplate(){
		this.render('current-page', { outlet: 'current-page' });
		this.render('current-service', { outlet: 'current-service' });
		this.render('content', { outlet: 'content' });
	},
	redirect(model, transition){
		if (model.get('length') === 1) {
      		this.transitionTo('service', model.get('firstObject'));
    	}
	}
});