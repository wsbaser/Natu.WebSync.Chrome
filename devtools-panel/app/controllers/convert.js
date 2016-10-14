import Ember from 'ember';

export default Ember.Controller.extend({
	vsclient: Ember.inject.service('vsclient'),
	init(){
		console.log("Init ConvertController...");
		var vsclient = this.get('vsclient');
		vsclient.on("ConvertedSelector", this.onTargetSelectorReceived.bind(this));
	},
	onTargetSelectorReceived(json){
		var data = JSON.parse(json);
		this.set('targetScss', data.Scss);
		this.set('targetCss', data.Css);
		this.set('targetXPath', data.XPath);
	},
	actions:{
		onSourceSelectorChanged: function(selector) {
			var vsclient = this.get('vsclient');
			vsclient.convertSelector(selector);
		}
	}
});
