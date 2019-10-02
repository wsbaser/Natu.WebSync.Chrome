import Ember from 'ember';
import { isArray } from '@ember/array';

export default Ember.Object.extend({
	toggle(){
		let isSelected = this.get('isSelected');
		let attributeValue = this.get('value');
		let part = this.get('part');
		let partPropertyName = this.get('partPropertyName');
		let partAttributeValue = part && partPropertyName?part.get(partPropertyName):null;
		
		// .update part
		if(isSelected){
			// .remove from part
			if(isArray(partAttributeValue)){
				partAttributeValue.removeObject(attributeValue);
			}else{
				part.set(partPropertyName, null);
			}
		}else{
			// .add to part
			if(isArray(partAttributeValue)){
				partAttributeValue.pushObject(attributeValue);
			}
			else{
				part.set(partPropertyName, attributeValue);
			}
		}
		// .toggle selected state
		this.toggleProperty('isSelected');
	}
});
