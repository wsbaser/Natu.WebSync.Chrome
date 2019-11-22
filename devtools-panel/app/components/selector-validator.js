import Ember from 'ember';
import { A } from '@ember/array';

export default Ember.Component.extend({
	tagName: 'span',
	classNames: ['validator'],
	validatedParts: A([]),
	// lastPartObserver: Ember.observer('parts.lastObject.count', function(){
	// 	this.set('status', this.get('parts.lastObject.count'));
	// }),
	// getElementsCount(iframesDataList){
	// 	var count=0;
	// 	iframesDataList.forEach(function(iframeData){
	// 		count+=iframeData.elements.length;
	// 	});
	// 	return count;
	// },
	// onSelectedIndexChanged: Ember.observer('selectedPartIndex', function(){
	//     let parts = this.get('parts');
	//     let selectedPartIndex = this.get('selectedPartIndex');
	//     for (var i = parts.length - 1; i >= 0; i--) {
	//     	parts[i].set('isSelected', i==selectedPartIndex);
	//     }
	// }),
	actions:{
		onPartSelected(part, elements){
			let onPartSelected = this.get('onPartSelected');
			if(onPartSelected){
				this.get('onPartSelected')(part, elements);
			}
		},
			onRemovePart(part){
			let onRemovePart = this.get('onRemovePart');
			if(onRemovePart){
				onRemovePart(part);
			}
		}
	}
});
