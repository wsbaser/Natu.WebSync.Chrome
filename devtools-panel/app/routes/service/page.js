import Ember from 'ember';

export default Ember.Route.extend({
	renderTemplate(){
		this.render('service/page/current-page', { outlet: 'current-page' });
		this.render('service/page/content', { outlet: 'content' });
	},
	model(params){
		return this.store.peekRecord('page-type', params.page_id);
	},
	afterModel(model){
		localStorage.currentPage = model.id;
	},
	setupController: function(controller, model){
		this._super(controller, model);

		controller.recalculateTreeData();
		controller.validateTreeSelectors();
	}
});