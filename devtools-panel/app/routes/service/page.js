import Ember from 'ember';

export default Ember.Route.extend({
	model(params){
		return this.store.peekRecord('page-type', params.pageType_id);
	},
	afterModel(model){
		this.controllerFor('service').set('page', model);
		if(model){
			localStorage.currentPage = model.id;
		}
	},
	setupController: function(controller, model){
		this._super(controller, model);
		if(model){
			controller.rebuildTree();
		}
	}
});