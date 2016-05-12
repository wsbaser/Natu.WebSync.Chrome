import Ember from 'ember';

export default Ember.Route.extend({
	renderTemplate(){
		this.render('service/page/current-page', { outlet: 'current-page' });
		// this.render('service/page/content', { outlet: 'content' });
	}
});
