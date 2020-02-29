import Service from '@ember/service';
import SelectorPartElement from '../models/selector-part-element';
import SelectorPart from '../models/selector-part';
import ElementAttribute from '../models/element-attribute';
import { A, isArray } from '@ember/array';

export default Service.extend({
	generateBlankPart(isCssStyle){
		return SelectorPart.create({
					combinator: '',
					id: '',
					tagName: '',
					classNames: A([]),
					attributes: Ember.Object.create({}),
					texts: A([]),
					scss: '',
					xpath: '',
					fullXpath: '',
					css: '',
					fullCss: '',
					isEditable: true,
					isCssStyle: isCssStyle
				});
	},
	generateParts(scssParts){
		return A(scssParts.map(scssPart=>{
				var supportedAttributes = ["name", "type"];
				let hasUnsupportedAttributes = 
					scssPart.attributes && 
					scssPart.attributes.some(a=>supportedAttributes.indexOf(a.name)==-1);

				var notEditable = 
					scssPart.isXpath || !scssPart.xpath || // scssPart.xpath==undefinded means this is a pure css selector part wich could not be converted to xpath
					hasUnsupportedAttributes ||
					scssPart.conditions && scssPart.conditions.length ||
					scssPart.subelementXpaths && scssPart.subelementXpaths.length ||
					scssPart.func ||
					scssPart.functionArgument && scssPart.functionArgument.length;

				var attributes = Ember.Object.create({});
				if(scssPart.attributes){
					scssPart.attributes.forEach((a)=>{
						if(supportedAttributes.indexOf(a.name)!=-1){
							attributes.set(a.name, a.value);
						}
					});
				}

				return SelectorPart.create({
						combinator: scssPart.combinator,
						id: scssPart.id,
						tagName: scssPart.tagName,
						classNames: A(scssPart.classNames),
						attributes: attributes,
						texts: A(scssPart.texts),
						scss: scssPart.scss,
						css: scssPart.css,
						xpath: scssPart.xpath,
						fullScss: scssPart.fullScss,
						fullCss: scssPart.fullCss,
						fullXpath: scssPart.fullXpath,
						index: scssPart.index,
						isEditable: !notEditable,
						isCssStyle: scssPart.isCssStyle,
						startIndex: scssPart.startIndex
					});
			}));

            // attributes: attributes,
            // conditions: conditions,
            // subelementXpaths: subelementXpaths,
            // func: func,
            // functionArgument: functionArgument
	},
	generateChildElements(partElement, children, indicesChain){
		indicesChain = indicesChain || [];
		let childPartElements = [];
		let blankPart = this.generateBlankPart(true);
		for (var i = 0; i<children.length; i++) {
			let element = children[i];
			let childIndicesChain = [...indicesChain, i];
			let childPartElement = SelectorPartElement.create({
				parentElement: partElement,
				childIndicesChain: childIndicesChain,
				part: blankPart,
				tagName: this.getElementAttribute(element.tagName, blankPart, "tagName", true),
				id: this.getElementAttribute(element.id, blankPart, "id"),
				attributes: this.getSupportedElementAttributes(element, blankPart),
				classNames: this.getElementAttributes(element.classNames, blankPart, "classNames"),
				innerText: this.getElementAttribute(element.innerText, blankPart, "texts"),
				displayed: element.displayed,
				hasChildren: element.hasChildren,
				containsTags: element.containsTags
			});
			childPartElement.set('children', this.generateChildElements(partElement, element.children, childIndicesChain));
			childPartElements.push(childPartElement);
		};

		return childPartElements;
	},
	generateElements(part, iframesDataList, isXpath){
		let elements = [];
		for (var i = 0; i < iframesDataList.length; i++) {
			let iframeData = iframesDataList[i];
			for (var j = 0; j < iframeData.elements.length; j++) {
				let element = iframeData.elements[j];			
				elements.push(SelectorPartElement.create({
					index: j+1,
					part: part,
					foundByXpath: isXpath,
					tagName: this.getElementAttribute(element.tagName, part, "tagName", true),
					id: this.getElementAttribute(element.id, part, "id"),
					attributes: this.getSupportedElementAttributes(element, part),
					classNames: this.getElementAttributes(element.classNames, part, "classNames"),
					innerText: this.getElementAttribute(element.innerText, part, "texts"),
					displayed: element.displayed,
					hasChildren: element.hasChildren,
					containsTags: element.containsTags,
					iframeIndex: i,
					elementIndex: j,
					isSelected: element.isInspected
				}));
			}
		}
		return elements;
	},
	getSupportedElementAttributes(element, part){
		let attributes = [];
		if(element.name){
			attributes.push(this.getElementAttribute(element.name, part, "attributes.name", false, "name"));
		}
		if(element.type){
			attributes.push(this.getElementAttribute(element.type, part, "attributes.type", false, "type"));
		}
		return attributes;
	},
	getElementAttributes(elementClasses, part, propertyName){
		return elementClasses.map(elementClass=>this.getElementAttribute(elementClass, part, propertyName));
	},
	getElementAttribute(value, part, partPropertyName, ignoreCase, name){
		if(value){
			if(!part.get('isEditable')){
				return ElementAttribute.create({
					name: name,
					value: value,
					part: part,
					partPropertyName: partPropertyName,
					isSelected: false
				});
			}

			value = ignoreCase?value.toLowerCase():value;
			let partAttributeValue = part && partPropertyName?part.get(partPropertyName):null;
			let valuesToSelect;
			if(isArray(partAttributeValue)){
				valuesToSelect = ignoreCase?partAttributeValue.map(c=>c.toLowerCase()):partAttributeValue;
			}else if(partAttributeValue){
				valuesToSelect = [ignoreCase?partAttributeValue.toLowerCase():partAttributeValue];
			}else{
				valuesToSelect = [];
			}
			let isSelected = valuesToSelect.indexOf(value)!=-1;
			return ElementAttribute.create({
				name: name,
				value: value,
				part: part,
				partPropertyName: partPropertyName,
				isSelected: isSelected
			});
		}
		return null;
	}
});
