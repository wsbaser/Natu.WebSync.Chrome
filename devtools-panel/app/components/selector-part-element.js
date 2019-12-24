import Component from '@ember/component';;
import Ember from 'ember';

export default Component.extend({
	tagName: 'li',
	classNames: ['clearfix', 'part-element'],
	classNameBindings:[
		'partElement.isSelected:selected',
		'partElement.displayed::not-displayed',
		'partElement.hasChildren:parent',
		'partElement.isExpanded:expanded'],
	selectorPartFactory: Ember.inject.service(),
	selectorHighlighter: Ember.inject.service(),
	selectorInspector: Ember.inject.service(),
	selectorValidator: Ember.inject.service(),
	init(){
		this._super(...arguments);
		Ember.run.schedule("afterRender", this, function() {
			this.scrollToIfSelected();
    	});
	},
	click(){
		this.inspectElement();
		this.set('partElement.isSelected', true);
		let onSelected = this.get('onSelected');
		if(onSelected){
			onSelected(this.get('partElement'));
		}
	},
	scrollToIfSelected(){
		if(this.get('partElement.isSelected')){
			this.$()[0].scrollIntoViewIfNeeded(true);
		}
	},
	selectedChanged: Ember.observer('partElement.isSelected', function(){
		this.scrollToIfSelected();
	}),
	getFoundBySelector(){
		return this.get('partElement.foundByXpath')?
			{ xpath: this.get('partElement.part.fullXpath') }:
			{ css: this.get('partElement.part.fullCss') };
	},
	inspectElement(){
		let selectorInspector = this.get('selectorInspector');
		selectorInspector.inspect(
				this.getFoundBySelector(),
				this.get('partElement.iframeIndex'), 
				this.get('partElement.elementIndex'));
	},
	highlightElement(){
		let selectorHighlighter = this.get('selectorHighlighter');
		if(this.get('partElement.part.isBlank')){
			selectorHighlighter.highlightInspectedElement();
		}else{
			selectorHighlighter.highlight(
				this.getFoundBySelector(), 
				this.get('partElement.iframeIndex'),
				this.get('partElement.elementIndex'));
		}
	},
	loadChildren(){
		this.get('selectorHighlighter').loadChildren(
			this.getFoundBySelector(),			
			this.get('partElement.iframeIndex'), 
			this.get('partElement.elementIndex'),
			this.onChildrenLoaded.bind(this));
	},
	onChildrenLoaded(result, exception){
		let children = this.get('selectorPartFactory').generateChildElements(result);
		this.set('partElement.children', children);
	},
	actions:{
		onInspectElement(element){
			this.inspectElement();
			element.set('isSelected', true);
			let onSelected = this.get('onSelected');
			if(onSelected){
				onSelected(element);
			}
		},
		onElementMouseEnter(){
			this.highlightElement();
		},
		onMouseLeave(){
			this.get('selectorHighlighter').removeHighlighting();
		},
		onAttributeToggle(){
			if(this.get('partElement.part.isEditable') || this.get('partElement.part.isBlank')){
				let onAttributeToggle = this.get('onAttributeToggle');
				if(onAttributeToggle){
					onAttributeToggle();
				}
			}
		},
		expand(){
			this.toggleProperty('partElement.isExpanded');
			if(this.get('partElement.isExpanded') && !this.get('partElement.children')){
				this.loadChildren();
			}
		}
	}
});
