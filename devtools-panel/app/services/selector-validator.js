import Ember from 'ember';
import RSVP from 'rsvp';


export default Ember.Service.extend({
	validate(selector){
		if( !selector || (!selector.css && !selector.xpath)){
			return Promise.resolve(null);
		}
		return RSVP.hash({
			css: selector.css ? this.validateCss(selector.css) : { isValid:false },
			xpath: selector.xpath ? this.validateXpath(selector.xpath) : { isValid:false }
		});
	},
	validateCss(css){
    	return this._callEval('evaluateCss("' + css + '")');
	},
	validateXpath(xpath){
		return this._callEval('evaluateXpath("' + xpath + '")');
	},
	_callEval(script){
		let deferred = Ember.$.Deferred();
		chrome.devtools.inspectedWindow.eval(
	      script,
	      { useContentScriptContext: true },
	      function(result, isException) {
	      	let validationData = {};
			if(isException){
				validationData.isValid = false;
				validationData.count = 0;
			}
			else{
				validationData.isValid = true;
				validationData.count = this._getNodesCount(result);
				validationData.displayedCount = this._getNodesCount(result, true);
			}
			deferred.resolve(validationData);
	      }.bind(this));
		return deferred.promise();
	},
	_getNodesCount(iframesDataList, displayedOnly){
		var count=0;
		iframesDataList.forEach(function(iframeData){
			count += displayedOnly?
				iframeData.elements.filter(e=>e.displayed).length:
				iframeData.elements.length;
		});
		return count;
	}
});
