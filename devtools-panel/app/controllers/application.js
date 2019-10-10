import Ember from 'ember';
import { A } from '@ember/array';
import { once } from '@ember/runloop';
import SelectorPart from '../models/selector-part';

export default Ember.Controller.extend({
	scssParser: Ember.inject.service(),
	scssBuilder: Ember.inject.service(),
	inputValue: '',
	init(){
		console.log ("Init ConvertController...");
		Ember.run.schedule("afterRender", this, function() {
      		this.focusInput();
    	});
	},
	isExist: Ember.computed('cssStatus', 'xpathStatus', 'parts.[]', function(){
		return (this.get('scss.css') && this.get('cssStatus')>0) ||
			(this.get('scss.xpath') && this.get('xpathStatus')>0);
	}),
	isSeveral: Ember.computed('cssStatus', 'xpathStatus', 'parts.[]', function(){
		return (this.get('scss.css') && this.get('cssStatus')>1) ||
		 	(this.get('scss.xpath') && this.get('xpathStatus')>1);
	}),
	focusInput(){
		document.getElementById('source').focus();
	},
	selectInput(){
		document.getElementById('source').select();
	},
	onSourceSelectorChanged: Ember.observer('inputValue', function(){
		var selector = this.get('inputValue').trim();
		var scssParser = this.get('scssParser');

		let scss;
		try {
			scss = scssParser.parse(selector);            
		} catch (e) {
			console.log('Unable to convert scss selector "' + selector + '"');
		}
		scss = scss || {
				parts: [],
				css: null,
				xpath: null
			};
		this.set('scss', scss);
		this.set('parts', this.generateParts(scss.parts));
		this.set('selectedPart', null);
		this.set('elements',[]);

		if(!selector){
			this.focusInput();
		}
	}),
	generateParts(scssParts){
		return A(scssParts.map(scssPart=>
			SelectorPart.create({
					isXPath: true,
					id: scssPart.id,
					tagName: scssPart.tagName,
					classNames: A(scssPart.classNames),
					texts: scssPart.texts,
					scss: scssPart.scss,
					xpath: scssPart.xpath,
					fullXpath: scssPart.fullXpath,
					css: scssPart.css,
					fullCss: scssPart.fullCss,
					index: scssPart.index
				})));
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
		},
		onPartAttributeToggle(){
			let parts = this.get('parts');
			let scssBuilder = this.get('scssBuilder');
			parts.forEach(part=>{
				part.set('scss', scssBuilder.buildScssPart({
					id: part.id,
					tagName: part.tagName,
					classNames: part.classNames,
					texts: part.texts
				}));
			});
			let scss = parts.map(part=>part.scss).join(' ');
			this.set('inputValue', scss);
		},
		onPartSelected(part, elements){
			this.set('selectedPart', part);
			this.set('elements', elements);
		},
		onPartElementSelected(element){
			this.get('elements').forEach(function(e){
	          if(e != element){
	        	e.set('isSelected', false);
	          }
	        });
		}
	}
});