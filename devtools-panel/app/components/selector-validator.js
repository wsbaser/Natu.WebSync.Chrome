import Ember from 'ember';

export default Ember.Component.extend({
	tagName: 'span',
	classNames: ['validator'],
	classNameBindings:['isExist:exist','isSeveral:several'],
	count: 0,
	isSeveral: Ember.computed('count', function(){
		return this.get('count')>1;
	}),
	isExist: Ember.computed('count', function(){
		return this.get('count')>0;
	}),
	evaluateSelector(scriptToEvaluateSelector){
	   	chrome.devtools.inspectedWindow.eval(
	      scriptToEvaluateSelector,
	      { useContentScriptContext: true },
	      function(result, isException) {
			if(isException){
				this.set('isValid', false);
				this.set('count', 0);
			}
			else{
				this.set('isValid', true);
				this.set('count', this.getNodesCount(result));
			}
	      }.bind(this));
	},
	getNodesCount(iframe2Nodes){
		var count=0;
		for (var iframe in iframe2Nodes) {
			count+=iframe2Nodes[iframe].length;
		};
		return count;
	}
});
