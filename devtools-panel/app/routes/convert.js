import Ember from 'ember';

export default Ember.Route.extend({
	model: function(params){
	},
	setupController: function(controller, userBooks){
  		this._super(controller, this.language);
  	}
});
