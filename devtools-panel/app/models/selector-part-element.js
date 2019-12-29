import Ember from 'ember';

export default Ember.Object.extend({
	isUnlocked: Ember.computed('isSelected', 'part.isCssStyle', 'part.isEditable', function(){
		return this.get('isSelected') && this.get('part.isCssStyle') && this.get('part.isEditable');
	}),
	isChild: Ember.computed('parent', function(){
		return !!this.get('isChild');
	}),
	rootElement: Ember.computed('parentElement', function(){
		if(this.get('parentElement')){
			return this.get('parentElement.rootElement');
		}
		return this;
	}),
	getSelector(){
		let selector;

		if(this.get('isChild')){
			selector = this.get('rootElement').getSelector();
			selector.childIndicesChain = this.get('childIndicesChain');
		}
		else{
			if(this.get('isBlank')){
				selector = { inspected: true};
			}else{
				selector = this.get('foundByXpath')?
					{ xpath: this.get('part.fullXpath') }:
					{ css: this.get('part.fullCss') };
				selector.iframeIndex = this.get('iframeIndex');
				selector.elementIndex = this.get('elementIndex');
			}
		}

		return selector;
	}
});