import Ember from 'ember';
import SelectorPartElement from '../models/selector-part-element';
import ElementAttribute from '../models/element-attribute';
import { isArray } from '@ember/array';

export default Ember.Component.extend({
	tagName: 'span',
	classNames: ['validator'],
	lastPartObserver: Ember.observer('parts.lastObject.count',function(){
		this.set('status', this.get('parts.lastObject.count'));
	}), 
	validateSelectorPart(part, scriptToEvaluateSelector){
	   	chrome.devtools.inspectedWindow.eval(
	      scriptToEvaluateSelector,
	      { useContentScriptContext: true },
	      function(result, isException) {
			if(isException){
				part.set('isValid', false);
				part.set('elements', []);
				part.set('count', 0);
			}
			else{
				var elements = this.getElements(part, result);
				part.set('isValid', true);
				part.set('elements', elements);
				part.set('count', elements.length);
			}
	      }.bind(this));
	},
	getElements(part, iframesDataList){
		let elements = [];
		for (var i = 0; i < iframesDataList.length; i++) {
			let iframeData = iframesDataList[i];
			for (var j = 0; j < iframeData.elements.length; j++) {
				let element = iframeData.elements[j];
				elements.push(SelectorPartElement.create({
					part: part,
					tagName: this.getElementAttribute(element.tagName, part, "tagName", true),
					id: this.getElementAttribute(element.id, part, "id"),
					attributes: [],
					classNames: this.getSelectableClassNames(element.classNames, part, "classNames"),
					innerText: this.getElementAttribute(element.innerText, part, "texts"),
					displayed: element.displayed,
					containsTags: element.containsTags,
					iframeIndex: i,
					elementIndex: j
				}));
			}
		}
		return elements;
	},
	getSelectableClassNames(elementClasses, part, propertyName){
		for (var i = elementClasses.length - 1; i >= 0; i--) {
			this.getElementAttribute(elementClasses[i], part, propertyName);
		};
	},
	getElementAttribute(value, part, partPropertyName, ignoreCase){
		if(value){
			let partAttributeValue = part && partPropertyName?part.get(partPropertyName):null;
			let valuesToSelect;
			if(isArray(partAttributeValue)){
				valuesToSelect = ignoreCase?partAttributeValue.map(c=>c.toLowerCase()):partAttributeValue;
			}else{
				valuesToSelect = [ignoreCase?partAttributeValue.toLowerCase():partAttributeValue];
			}
			let isSelected = valuesToSelect.indexOf(value)!=-1;
			return ElementAttribute.create({
				value: value,
				part: part,
				partPropertyName: partPropertyName,
				isSelected: isSelected
			});
		}
		return null;
	},
	// getElementsCount(iframesDataList){
	// 	var count=0;
	// 	iframesDataList.forEach(function(iframeData){
	// 		count+=iframeData.elements.length;
	// 	});
	// 	return count;
	// },
	onSelectedIndexChanged: Ember.observer('selectedPartIndex', function(){
	    let parts = this.get('parts');
	    let selectedPartIndex = this.get('selectedPartIndex');
	    for (var i = parts.length - 1; i >= 0; i--) {
	    	parts[i].set('isSelected', i==selectedPartIndex);
	    }
	}),
	actions:{
  		onPartSelected(part){
  			this.get('onPartSelected')(part);
  		},
  		onRemovePart(part){
  			this.get('onRemovePart')(part);
  		}
  	}
});
