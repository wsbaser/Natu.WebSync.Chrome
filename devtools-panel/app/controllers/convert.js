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
		this.set('targetSelector', data.selector);
	},
	actions:{
		onSourceSelectorChanged: function(selector) {
			var vsclient = this.get('vsclient');
			vsclient.convertSelector(selector);
		}
	}
});
