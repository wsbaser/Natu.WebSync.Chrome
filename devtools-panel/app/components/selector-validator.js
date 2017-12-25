import Ember from 'ember';
import SelectorPart from '../models/selector-part';
import SelectorPartElement from '../models/selector-part-element';

export default Ember.Component.extend({
	tagName: 'span',
	classNames: ['validator'],
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
				var elements = this.getElements(result);
				part.set('isValid', true);
				part.set('elements', elements);
				part.set('count', elements.length);

			}
	      }.bind(this));
	},
	getElements(iframesDataList){
		let elements = [];
		for (var i = 0; i < iframesDataList.length; i++) {
			let iframeData = iframesDataList[i];
			for (var j = 0; j < iframeData.elements.length; j++) {
				let element = iframeData.elements[j];
				elements.push(SelectorPartElement.create({
					displayed: element.displayed,
					html: element.html,
					iframeIndex: i,
					elementIndex: j
				}));
			}
		}
		return elements;
	},
	// getElementsCount(iframesDataList){
	// 	var count=0;
	// 	iframesDataList.forEach(function(iframeData){
	// 		count+=iframeData.elements.length;
	// 	});
	// 	return count;
	// },
	splitToParts(selectorString, delimiters){
  		var fullSelector='';
  		var parts = [];
  		var partSelectors = this.splitIgnoringConditions(selectorString, delimiters);
  		partSelectors.forEach(function(partSelector){
			fullSelector+=partSelector;
			parts.push(SelectorPart.create({
				selector:partSelector,
				fullSelector:fullSelector
			}));
  		});
  		return parts;
  	},
	splitIgnoringConditions(selector, delimiters) {
		var selectorParts = [];
		var value = '';
		var readCondition = false;
		var conditionOpenBracketsCount = 0;
		var hasCharsExeptDelimiters = function (d){return delimiters.indexOf(d)===-1;};
		for (var i = 0; i < selector.length; i++) {
		    var c = selector[i];
		    if (readCondition) {
			    if (c === '['){
					conditionOpenBracketsCount++;
			    }
			    else if (c === ']') {
			    	if(conditionOpenBracketsCount===0){
			    		readCondition=false;
			    	}
			    	else{
						conditionOpenBracketsCount--;
			    	}
			    }
		    }
		    else if (delimiters.indexOf(c)!==-1)
		    {
		    	if(Array.from(value).some(hasCharsExeptDelimiters)) {
					selectorParts.push(value);
					value = '';
		    	}
		    }
		    else if (c === '[') {
		    	readCondition = true;
		    }
		    value += c;
		}
		if(value){
			selectorParts.push(value);
		}
		return selectorParts;
	}
});
