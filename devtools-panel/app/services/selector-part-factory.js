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
				var notEditable = 
					scssPart.isXpath ||
					scssPart.attributes && scssPart.attributes.length ||
					scssPart.conditions && scssPart.conditions.length ||
					scssPart.subelementXpaths && scssPart.subelementXpaths.length ||
					scssPart.func ||
					scssPart.functionArgument && scssPart.functionArgument.length;

				return SelectorPart.create({
						combinator: scssPart.combinator,
						id: scssPart.id,
						tagName: scssPart.tagName,
						classNames: A(scssPart.classNames),
						texts: A(scssPart.texts),
						scss: scssPart.scss,
						xpath: scssPart.xpath,
						fullXpath: scssPart.fullXpath,
						css: scssPart.css,
						fullCss: scssPart.fullCss,
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
		for (var i = children.length - 1; i >= 0; i--) {
			let element = children[i];
			let childIndicesChain = [...indicesChain, i];
			let childPartElement = SelectorPartElement.create({
				parentElement: parentElement,
				childIndicesChain: childIndicesChain,
				part: blankPart,
				tagName: this.getElementAttribute(element.tagName, part, "tagName", true),
				id: this.getElementAttribute(element.id, part, "id"),
				attributes: [],
				classNames: this.getElementAttributes(element.classNames, part, "classNames"),
				innerText: this.getElementAttribute(element.innerText, part, "texts"),
				displayed: element.displayed,
				hasChildren: element.hasChildren,
				containsTags: element.containsTags
			});
			childPartElement.set('children', this.generateChildElements(partElement, element.children, childIndicesChain));
			childPartElements.push(partElement);
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
					part: part,
					foundByXpath: isXpath,
					tagName: this.getElementAttribute(element.tagName, part, "tagName", true),
					id: this.getElementAttribute(element.id, part, "id"),
					attributes: [],
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
	getElementAttributes(elementClasses, part, propertyName){
		return elementClasses.map(elementClass=>this.getElementAttribute(elementClass, part, propertyName));
	},
	getElementAttribute(value, part, partPropertyName, ignoreCase){
		if(value){
			if(!part.get('isEditable')){
				return ElementAttribute.create({
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
				value: value,
				part: part,
				partPropertyName: partPropertyName,
				isSelected: isSelected
			});
		}
		return null;
	}
});
