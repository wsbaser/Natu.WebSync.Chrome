import Component from '@ember/component';

export default Component.extend({
	tagName: 'ul',
	classNames: ['clearfix', 'children'],
	classNameBindings:[
		'partElement.isExpanded:expanded'
	],
	actions:{
		onAttributeToggle(){
			let onAttributeToggle = this.get('onAttributeToggle');
			if(onAttributeToggle){
				onAttributeToggle();
			}
		},
		onSelected(element){
			let onSelected = this.get('onSelected');
			if(onSelected){
				onSelected(element);
			}
		}
	}
});