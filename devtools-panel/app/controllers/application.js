import Ember from 'ember';

export default Ember.Controller.extend({
	scssBuilder: Ember.inject.service(),
	inputValue: '',
	init(){
		console.log ("Init ConvertController...");
		Ember.run.schedule("afterRender", this, function() {
      		this.focusInput();
    	});
	},
	// isExist: Ember.computed('cssStatus', 'xpathStatus', 'parts.[]', function(){
	// 	return (this.get('targetCss') && this.get('cssStatus')>0) ||
	// 		(this.get('targetXPath') && this.get('xpathStatus')>0);
	// }),
	// isSeveral: Ember.computed('cssStatus', 'xpathStatus', 'parts.[]', function(){
	// 	return (this.get('targetCss') && this.get('cssStatus')>1) ||
	// 	 	(this.get('targetXPath') && this.get('xpathStatus')>1);
	// }),
	focusInput(){
		document.getElementById('source').focus();
	},
	selectInput(){
		document.getElementById('source').select();
	},
	onSourceSelectorChanged: Ember.observer('inputValue', function(){
		var selector = this.get('inputValue').trim();
		var scssBuilder = this.get('scssBuilder');

		let scss;
		try {
			scss = scssBuilder.create(selector);            
		} catch (e) {
			console.log('Unable to convert scss selector "' + selector + '"');
		}
		scss = scss || {
				parts: [],
				css: null,
				xpath: null
			};
		this.set('scss', scss);
		this.set('selectedPart', null);

		if(!selector){
			this.focusInput();
		}
	}),
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
		onRemovePart(part){
			let scss = this.get('scss');
			scss.parts.removeAt(part.get('index'));
			let modifiedScss =  scss.parts.map(p=>p.scss).join('')
			this.set('inputValue', modifiedScss);
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