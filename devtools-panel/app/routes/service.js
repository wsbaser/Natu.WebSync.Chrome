import Ember from 'ember';

export default Ember.Route.extend({
	vsclient: Ember.inject.service('vsclient'),
	// beforeModel(){
	// 	// setTimeout(function(){
	// 	// 	console.log("push payload");
	// 	// 	this.pushTestPayload();
	// 	// }.bind(this), 3000);
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
		var vsclient = this.get('vsclient');
		vsclient.on("SessionWebData", this.invalidateRoute.bind(this));
	},
	redirect(model, transition){
		var currentPage;
		if(model){
			currentPage = model.get('pages').findBy('id', localStorage.currentPage);
		}
		this.transitionTo('service.page', currentPage);
	},
	invalidateRoute(){
		var serviceModel = this.controller.get('model');
		if(!serviceModel){
			var currentService = this.store.peekAll('service').findBy('id', localStorage.currentService)
			if(currentService){
				this.transitionTo('service', currentService);
			}
		}
	}
});