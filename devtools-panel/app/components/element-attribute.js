import Component from '@ember/component';

export default Component.extend({
	tagName: 'span',
	actions:{
		onSelect(){
			let attribute = this.get('attribute');
			let unlocked = this.get('unlocked');
			if(unlocked){
				attribute.toggle();
				let onToggle = this.get('onToggle');
				if(onToggle){
					onToggle();
				}
			}
		}
	}
});
