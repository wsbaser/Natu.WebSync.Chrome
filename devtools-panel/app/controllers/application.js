import Ember from 'ember';

export default Ember.Controller.extend({
	vsclient: Ember.inject.service('vsclient'),
	inputValue: '',
	init(){
		console.log ("Init ConvertController...");
		var vsclient = this.get('vsclient');
		vsclient.on("ConvertedSelector", this.onTargetSelectorReceived.bind(this));
		Ember.run.schedule("afterRender", this, function() {
      		document.getElementById('source').focus();
    	});
	},
	onSourceSelectorChanged: Ember.observer('inputValue', function(){
		var selector = this.get('inputValue').trim();
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
	},
	getSelectorRootElement(selectorType){
		switch(selectorType){
			case 0:
				return $('#targetScss');
			case 1:
				return $('#targetCss');
			case 2:
				return $('#targetXPath');
			default:
				throw new Error("Invalid selector type.");
		}
	},
	copyToClipboard(text) {
	    var $temp = $("<input>");
	    $("body").append($temp);
	    $temp.val(text).select();
	    document.execCommand("copy");
	    $temp.remove();
	},
	actions:{
		copySelectorStart(selectorType, value){
			this.getSelectorRootElement(selectorType).addClass('selected');
			this.copyToClipboard(value);
		},
		copySelectorEnd(selectorType){
			this.getSelectorRootElement(selectorType).removeClass('selected');
		}
	}
});