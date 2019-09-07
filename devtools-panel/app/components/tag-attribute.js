import Component from '@ember/component';

export default Component.extend({
	tagName: 'span',
	values: Ember.computed('attributeValue', 'splitBy', function(){
		let attributeValue = this.get('attributeValue');
		let splitBy = this.get('splitBy');
		let values=[];
		if(splitBy){
			let arr = attributeValue.split(splitBy);
			for (var i = 0; i < arr.length-1; i++) {
				values.push(Ember.Object.create({text: arr[i]+' '}));
			}
			values.push(Ember.Object.create({text: arr[arr.length-1]}));
		}else{
			values.push(Ember.Object.create({text: attributeValue}));
		}
		return values;
	}),
	actions:{
		onSelectValue(value){
			let selected = value.get('selected');
			value.set('selected', !selected);
		}
	}
});
