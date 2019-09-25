import Component from '@ember/component';

export default Component.extend({
	tagName: 'span',
	actions:{
		onSelectValue(value){
			let selected = value.get('selected');
			value.set('selected', !selected);
		}
	}
});
