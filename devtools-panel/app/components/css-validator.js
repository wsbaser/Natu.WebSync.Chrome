import Ember from 'ember';

export default Ember.Component.extend({
	tagName: 'span',
	classNames: ['validator'],
	classNameBindings:['isExist:exist:'],
	count: 0,
	isSeveral: Ember.computed('count', function(){
		return this.get('count')>1;
	}),
	isExist: Ember.computed('count', function(){
		return this.get('count')>0;
	}),
	validate: Ember.observer('value', function() {
    	var value = this.get('value');
    	try{
			var nodes = $(value);
			this.set('isValid', true);
			this.set('count',nodes?nodes.length:0);
    		console.log("Css is valid: " + nodes&&nodes.length);
    	}
    	catch(e){
			this.set('isValid', false);
			console.log("Css is invalid.")
    	}
  	}),
});
