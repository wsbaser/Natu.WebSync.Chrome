import Ember from 'ember';

export default Ember.Route.extend({
	renderTemplate(){
		this.render('navigation', { outlet: 'navigation' });
		this.render('body', { outlet: 'body' });
	}
});