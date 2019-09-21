import Ember from 'ember';

export default Ember.Controller.extend({
	vsclient: Ember.inject.service('vsclient'),
	scssBuilder: Ember.inject.service(),
	inputValue: '',
	init(){
		console.log ("Init ConvertController...");
		var vsclient = this.get('vsclient');
		vsclient.on("ConvertedSelector", this.onTargetSelectorReceived.bind(this));
		Ember.run.schedule("afterRender", this, function() {
      		this.focusInput();
    	});
	},
	isExist: Ember.computed('cssStatus', 'xpathStatus', 'targetCss', 'targetXPath', function(){
		return (this.get('targetCss') && this.get('cssStatus')>0) ||
			(this.get('targetXPath') && this.get('xpathStatus')>0);
	}),
	isSeveral: Ember.computed('cssStatus', 'xpathStatus', 'targetCss', 'targetXPath', function(){
		return (this.get('targetCss') && this.get('cssStatus')>1) ||
		 	(this.get('targetXPath') && this.get('xpathStatus')>1);
	}),
	focusInput(){
		document.getElementById('source').focus();
	},
	selectInput(){
		document.getElementById('source').select();
	},
	onSourceSelectorChanged: Ember.observer('inputValue', function(){
		var selector = this.get('inputValue').trim();
		var vsclient = this.get('vsclient');
		var scssBuilder = this.get('scssBuilder');

		let css = "";
		let xpath = "";
		try {
			let scss = scssBuilder.create(selector);
			if(scss.parts){
	            let isValidCss = scss.parts.every(p=>p.css);
	            css = isValidCss?scss.parts.map(p=>p.css).join(' '):null;
	            xpath = scss.parts.map(p=>p.xpath).join('');
			}
			else{
				xpath = scss.xpath;	
			}
		} catch (e) {
			console.log('Unable to convert scss selector "' + selector + '"');
		}
		this.set('targetCss', css || '');
		this.set('targetXPath', xpath || '');
		this.set('selectedPart', null);

		if(!selector){
			this.focusInput();
		}
	}),
	onTargetSelectorReceived(json){
		var data = JSON.parse(json);
		// this.set('targetScss', data.Scss);
		this.set('targetCss', data.Css||'');
		this.set('targetXPath', data.XPath||'');
	},
	getSelectorRootElement(selectorType){
		switch(selectorType){
			// case 0:
				// return $('#targetScss');
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
		},
		onPartSelected(part){
			this.set('selectedPart', part);
		},
		onRemoveSelector(){
			this.set('inputValue', '');
		},
		onCopySelector(){
			this.copyToClipboard(this.get('inputValue'));
			this.selectInput();
		}
	}
});