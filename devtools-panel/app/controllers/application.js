import Ember from 'ember';

export default Ember.Controller.extend({
	vsclient: Ember.inject.service('vsclient'),
	scssbuilder: Ember.inject.service('selector-scss-builder'),
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
		var scssBuilder = this.get('scssbuilder');
		console.log('KeyUp');
		if(vsclient.get("isConnected")){
			vsclient.convertSelector(selector);
		}
		else{
			console.log('Convertion service not available. Using selector without conversion.');

			let vScss = "";
			let vCss = "";
			let vXPath = "";
			try {
				let scssSelector = scssBuilder.create(selector);
				if (scssSelector.css) {
					vScss = "Css";
					vCss = scssSelector.css;
					vXPath = "";					
				} else {
					vScss = "XPath";
					vCss = "";
					vXPath = scssSelector.xpath;					
				}
			} catch (e) {
				vScss = e;
				vCss = "";
				vXPath = "";
			}
			this.set('targetScss', vScss);
			this.set('targetCss', vCss);
			this.set('targetXPath', vXPath);
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