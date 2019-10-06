import Ember from 'ember';
import SelectorPartElement from '../models/selector-part-element';
import ElementAttribute from '../models/element-attribute';
import { isArray } from '@ember/array';

export default Ember.Component.extend({
	tagName: 'span',
	classNames: ['part'],
	classNameBindings:[
		'isExist:exist',
		'isSeveral:several', 
		'hasHidden:hidden',
		'displayed::not-displayed',
		'part.isSelected:selected'],
	selectorValidator: Ember.inject.service(),
	selectorHighlighter: Ember.inject.service(),
	selectorInspector: Ember.inject.service(),
	isXPath: false,
	isSeveral: Ember.computed('count', function(){
		return this.get('count')>1;
	}),
	isExist: Ember.computed('count', function(){
		return this.get('count')>0;
	}),
	// hasHidden: Ember.computed('displayedCount', 'part.count', function(){
	// 	return this.get('part.count')>this.get('part.displayedCount');
	// }),
	displayed: Ember.computed('elements', function(){
		return this.get('elements')? 
			this.get('elements').some(e=>e.get('displayed')):
			false;
	}),
	init(){
		this._super(...arguments);
		this.validatePart();
	},
	validatePart(){
  		let selectorValidator = this.get('selectorValidator');
  		if(this.get('isXpath')){
			selectorValidator.validateXpath(this.get('part.fullXpath'), this.onSelectorValidated.bind(this));
  		}else{
			selectorValidator.validateCss(this.get('part.fullCss'), this.onSelectorValidated.bind(this));
  		}
	},
	inspectPart(){
		let selectorInspector = this.get('selectorInspector');
		if(this.get('isXpath')){
			selectorInspector.inspectXpath(this.get('part.fullXpath'));
		}else{
			selectorInspector.inspectCss(this.get('part.fullCss'));
		}
	},
	highlightPart(){
		let selectorHighlighter = this.get('selectorHighlighter')
		if(this.get('isXpath')){
			selectorHighlighter.highlightXpath(this.get('part.fullXpath'));
		}
		else{
			selectorHighlighter.highlightCss(this.get('part.fullCss'));
		}
	},
	onSelectorValidated(result, isException){
		if(isException){
			this.set('isValid', false);
			this.set('elements', []);
			this.set('count', 0);
		}
		else{
			let part = this.get('part');
			let elements = this.getElements(part, result);
			this.set('isValid', true);
			this.set('elements', elements);
			this.set('count', elements.length);
		}
	},
	getElements(part, iframesDataList){
		let elements = [];
		for (var i = 0; i < iframesDataList.length; i++) {
			let iframeData = iframesDataList[i];
			for (var j = 0; j < iframeData.elements.length; j++) {
				let element = iframeData.elements[j];
				elements.push(SelectorPartElement.create({
					part: part,
					foundByXpath: this.get('isXpath'),
					tagName: this.getElementAttribute(element.tagName, part, "tagName", true),
					id: this.getElementAttribute(element.id, part, "id"),
					attributes: [],
					classNames: this.getElementAttributes(element.classNames, part, "classNames"),
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
	getElementAttributes(elementClasses, part, propertyName){
		return elementClasses.map(elementClass=>this.getElementAttribute(elementClass, part, propertyName));
	},
	getElementAttribute(value, part, partPropertyName, ignoreCase){
		if(value){
			value = ignoreCase?value.toLowerCase():value;
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
	actions:{
		onInspectSelector(e){
			if(e.ctrlKey){
				// let partSelector = this.get('part.selector');
				// let fullSelector = this.get('part.fullSelector');
				// let sourceEl = $('#source')[0];
				// sourceEl.focus()
				// sourceEl.setSelectionRange(fullSelector.length-partSelector.length, fullSelector.length);
			}
			else{
				let elements = this.get('elements');
				if(elements.length>0){
					for (var i = elements.length - 1; i >= 0; i--) {
						elements[i].set('isSelected', false);
					};
					elements[0].set('isSelected', true);
					this.inspectPart();
				}
				this.set('part.isSelected', true);
				let onSelected = this.get('onSelected');
				if(onSelected){
					onSelected(this.get('part'), this.get('elements'));
				}
			}
		},
		onSelectorMouseEnter(){
			this.highlightPart();
		},
		onSelectorMouseLeave(){
			this.get('selectorHighlighter').removeHighlighting();
		},
		onRemove(){
			this.get('onRemove')(this.get('part'));
		}
	}
});