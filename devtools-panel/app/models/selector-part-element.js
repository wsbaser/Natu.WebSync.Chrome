import Ember from 'ember';

export default Ember.Object.extend({
	classNames: Ember.computed('className',function(){
		let className = this.get('className');
		let values=[];
		if(className){
			let arr = className.split(' ');
			for (var i = 0; i < arr.length-1; i++) {
				values.push(Ember.Object.create({text: arr[i]+' '}));
			}
			values.push(Ember.Object.create({text: arr[arr.length-1]}));
		}
		return values;
	})
});