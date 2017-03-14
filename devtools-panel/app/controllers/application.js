import Ember from 'ember';

export default Ember.Controller.extend({
	services: Ember.computed.alias('model'),
	vsclient: Ember.inject.service('vsclient'),
	inputValue: '',
	init(){
		console.log ("Init ConvertController...");
		var vsclient = this.get('vsclient');
		vsclient.on("ConvertedSelector", this.onTargetSelectorReceived.bind(this));
	},
	onSourceSelectorChanged: Ember.observer('inputValue', function(){
		var selector = this.get('inputValue');
		var vsclient = this.get('vsclient');
		console.log('KeyUp');
		if(vsclient.get("isConnected")){
			vsclient.convertSelector(selector);
		}
		else{
			console.log('Convertion service not available. Using selector without conversion.');
			this.set('targetCss', selector);
			this.set('targetXPath', selector);
		}		
	}),
	onTargetSelectorReceived(json){
		var data = JSON.parse(json);
		this.set('targetScss', data.Scss);
		this.set('targetCss', data.Css||'');
		this.set('targetXPath', data.XPath||'');
	}
});