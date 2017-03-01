import Ember from 'ember';

export default Ember.Route.extend({
	model: function(params){
		return this.store.peekAll('page-type');
	},
	setupController: function(controller, model){
  		this._super(controller, model);
  	}
});
