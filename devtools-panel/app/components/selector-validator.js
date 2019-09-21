import Ember from 'ember';
import SelectorPartElement from '../models/selector-part-element';

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
					tagName: element.tagName,
					id: element.id,
					className: element.className,
					innerText: element.innerText,
					displayed: element.displayed,
					containsTags: element.containsTags,
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
	actions:{
  		onPartSelected(part){
	        this.get('parts').forEach(function(p){
	          if(p != part){
	            p.set('isSelected', false);
	          }
	        });
  			this.get('onPartSelected')(part);
  		}
  	}
});
