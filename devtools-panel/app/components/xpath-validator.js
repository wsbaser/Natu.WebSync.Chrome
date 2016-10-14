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
			console.log('xpath:'+value);
			var nodes = document.evaluate(value, document, null, XPathResult.ANY_TYPE, null);
			var currentNode = nodes.iterateNext();
			this.set('isValid', true);
			var count=0;
			while(currentNode){
				count++;
				currentNode = nodes.iterateNext();
			}
			this.set('count',count);
		}
		catch(e){
			this.set('isValid', false);
			console.log("XPath is invalid.")
		}
  	})
});
