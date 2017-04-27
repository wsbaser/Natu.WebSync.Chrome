import Ember from 'ember';

export default Ember.Route.extend({
	// renderTemplate(){
	// 	this.render('service/current-service', { outlet: 'current-service' });
	// 	this.render('service/pages-list', { outlet: 'pages-list' });
	// 	this.render('service/content', { outlet: 'content' });
	// },
	model(params){
		return this.store.peekRecord('service', params.service_id);
	},
	afterModel(model){
		if(model){
			localStorage.currentService = model.id;
		}
	},
	setupController(controller, model){
		this._super(controller, model);
		controller.set('services', this.store.peekAll('service'));
	},
	redirect(model, transition){
		var currentPage;
		if(model){
			currentPage = model.get('pages').findBy('id', localStorage.currentPage);
		}
		this.transitionTo('service.page', currentPage);
	}
});