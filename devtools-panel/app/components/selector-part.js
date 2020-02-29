import Ember from 'ember';

export default Ember.Component.extend({
	tagName: 'span',
	classNames: ['part'],
	classNameBindings:[
		'isExist:exist',
		'isSeveral:several', 
		'hasHidden:hidden',
		'displayed::not-displayed',
		'part.isSelected:selected',
		'part.isBlank:blank'],
	selectorPartFactory: Ember.inject.service(),
	selectorValidator: Ember.inject.service(),
	selectorHighlighter: Ember.inject.service(),
	selectorInspector: Ember.inject.service(),
	pluralizer: Ember.inject.service(),
	isXPath: false,
	init(){
		this._super(...arguments);
		if(!this.get('part.isBlank')){
			this.validatePart();
		}
	},
	menuActions: [
		{ label: 'Delete part', action: 'deletePart' },
	    { label: 'Make root:', action: 'makeRoot' }	    
  	],
	tooltipText: Ember.computed('elements.[]', function(){
		let totalCount = this.get('elements.length');
		if(!totalCount){
			return "0 elements";
		}
		let displayedCount = this.get('elements').filter(e=>e.displayed).length;
		if(totalCount==displayedCount){
			return this.get("pluralizer").pluralize(totalCount,'element');
		}
		return this.get("pluralizer").pluralize(totalCount,'element') + 
			" total, "+
			this.get("pluralizer").pluralize(displayedCount,'element') + 
			" displayed";
	}),
	isSeveral: Ember.computed('elements.[]', function(){
		return this.get('elements.length')>1;
	}),
	isExist: Ember.computed('elements.[]', function(){
		return this.get('elements.length')>0;
	}),
	displayed: Ember.computed('elements.[]', function(){
		return this.get('elements')? 
			this.get('elements').some(e=>e.get('displayed')):
			false;
	}),
	onElementsChanged: Ember.observer('elements.[]',  function(){
		if(this.get('part.isSelected')){
			this.triggerOnSelected();
		}
	}),
	validatePart(callback){
		let f = function(result, isException){
			this.onSelectorValidated(result, isException);
			if(callback && !isException){
				callback();
			}
		}.bind(this);
		let selectorValidator = this.get('selectorValidator');
		if(this.get('isXpath')){
			selectorValidator.validateXpath(this.get('part.fullXpath'), f);
		}else{
			selectorValidator.validateCss(this.get('part.fullCss'), f);
		}
	},
	inspectPart(){
		let selectorInspector = this.get('selectorInspector');
		if(this.get('isXpath')){
			selectorInspector.inspectXpath(this.get('part.fullXpath'));
		}else{
			selectorInspector.inspectCss(this.get('part.fullCss'));
		}
	},
	highlightPart(){
		let selectorHighlighter = this.get('selectorHighlighter')
		if(this.get('isXpath')){
			selectorHighlighter.highlightXpath(this.get('part.fullXpath'));
		}
		else{
			selectorHighlighter.highlightCss(this.get('part.fullCss'));
		}
	},
	setPartElements(elements){
		if(this.get('isXpath')){
			this.set('part.xpathElements', elements);
		}else{
			this.set('part.cssElements', elements);
		}
		this.set('elements', elements);
	},
	onSelectorValidated(result, isException){
		if(isException){
			this.set('isValid', false);
			this.setPartElements([]);
		}
		else{
			if(result[0]){
				console.log(result[0].timeStatus);
			}
			let part = this.get('part');
			let elements = this.get('selectorPartFactory').generateElements(part, result, this.get('isXpath'));
			this.set('isValid', true);
			this.setPartElements(elements);
		}
	},
	triggerOnSelected(){
		let onSelected = this.get('onSelected');
		if(onSelected){
			onSelected(this.get('part'), this.get('elements'));
		}
	},
	actions:{
		onInspectSelector(e){
			if(e.ctrlKey){
				// let partSelector = this.get('part.selector');
				// let fullSelector = this.get('part.fullSelector');
				// let sourceEl = $('#source')[0];
				// sourceEl.focus()
				// sourceEl.setSelectionRange(fullSelector.length-partSelector.length, fullSelector.length);
			}
			else if(!this.get('part.isBlank')){
				this.validatePart(()=>{
					this.triggerOnSelected();
					if(!this.get('elements').any(e=>e.get('isSelected'))){
						// // .select first element
						// for (var i = elements.length - 1; i >= 0; i--) {
						// 	elements[i].set('isSelected', false);
						// };
						// elements[0].set('isSelected', true);
						this.inspectPart();
					}
				});
			}
		},
		onSelectorMouseEnter(){
			if(!this.get('part.isBlank')){
				this.highlightPart();
			}
		},
		onSelectorMouseLeave(){
			this.get('selectorHighlighter').removeHighlighting();
		},
		onRemove(){
			this.get('onRemove')(this.get('part'));
		}
	}
});