import Ember from 'ember';
import RSVP from 'rsvp';


export default Ember.Service.extend({
	validate(selector){
		return RSVP.hash({
			css: this.validateCss(selector.css),
			xpath: this.validateXpath(selector.xpath)
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
			}
			deferred.resolve(validationData);
	      }.bind(this));
		return deferred.promise();
	},
	_getNodesCount(iframesDataList){
		var count=0;
		iframesDataList.forEach(function(iframeData){
			count+=iframeData.elements.length;
		});
		return count;
	}
});
