import Ember from 'ember';
import SelectorPart from '../models/selector-part';

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
				part.set('count', 0);
			}
			else{
				part.set('isValid', true);
				part.set('count', this.getNodesCount(result));
			}
	      }.bind(this));
	},
	getNodesCount(iframe2Nodes){
		var count=0;
		for (var iframe in iframe2Nodes) {
			count+=iframe2Nodes[iframe].length;
		}
		return count;
	},
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
