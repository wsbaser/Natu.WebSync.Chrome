import Component from '@ember/component';

export default Component.extend({
	tagName: 'span',
	actions:{
		onSelectValue(){
			let value = this.get('value');
			let unlocked = this.get('unlocked');
			if(unlocked){
				value.toggleProperty('selected');
			}
		}
	}
});
