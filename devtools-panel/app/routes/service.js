import Ember from 'ember';

export default Ember.Route.extend({
	model(params){
		return this.store.peekRecord('service', params.service_id);
	},
	renderTemplate(){
		this.render('service/current-service', { outlet: 'current-service' });
		this.render('service/pages-list', { outlet: 'pages-list' });
		this.render('service/content', { outlet: 'content' });
	}
});