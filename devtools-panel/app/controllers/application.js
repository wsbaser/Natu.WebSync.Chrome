import Ember from 'ember';

export default Ember.Controller.extend({
	vsclient: Ember.inject.service('vsclient'),
	scssBuilder: Ember.inject.service(),
	selectorHighlighter: Ember.inject.service(),
	selectorInspector: Ember.inject.service(),
	inputValue: '',
	init(){
		console.log ("Init ConvertController...");
		var vsclient = this.get('vsclient');
		vsclient.on("ConvertedSelector", this.onTargetSelectorReceived.bind(this));
		Ember.run.schedule("afterRender", this, function() {
      		this.focusInput();
    	});
	},
	focusInput(){
		document.getElementById('source').focus();
	},
	onSourceSelectorChanged: Ember.observer('inputValue', function(){
		var selector = this.get('inputValue').trim();
		var vsclient = this.get('vsclient');
		var scssBuilder = this.get('scssBuilder');

		let css = "";
		let xpath = "";
		try {
			let scss = scssBuilder.create(selector);
			css = scss.css;
			xpath = scss.xpath;
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
		onInspectElement(element){
			this.get('selectorInspector').inspect(
				element.get('part.fullSelectorObj'), 
				element.get('iframeIndex'), 
				element.get('elementIndex'));
			element.set('isSelected', true);
			element.get('part.elements').forEach(function(e){
	          if(e != element){
	            e.set('isSelected', false);
	          }
	        });
		},
		onElementMouseEnter(element){
			this.get('selectorHighlighter').highlight(
				element.get('part.fullSelectorObj'), 
				element.get('iframeIndex'),
				element.get('elementIndex'));
		},
		onMouseLeave(){
			this.get('selectorHighlighter').removeHighlighting();
		},
		onRemoveSelector(){
			this.set('inputValue', '');
		}
	}
});