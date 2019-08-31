import Ember from 'ember';

export default Ember.Object.extend({
	htmlFormated: Ember.computed('html', function(){
	  	var html = this.get('html');
	  	return html.substring(0, 70);
	})
});