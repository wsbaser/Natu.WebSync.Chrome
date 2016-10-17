import Ember from 'ember';

export default Ember.Component.extend({
	tagName: 'span',
	classNames: ['part'],
	classNameBindings:['isExist:exist','isSeveral:several'],
	count: 0,
	isSeveral: Ember.computed('part.count', function(){
		return this.get('part.count')>1;
	}),
	isExist: Ember.computed('part.count', function(){
		return this.get('part.count')>0;
	}),
	click(){
		console.log('Click on selector-tag');
	}
});