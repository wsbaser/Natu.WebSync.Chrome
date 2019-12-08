import Component from '@ember/component';;
import Ember from 'ember';

export default Component.extend({
	tagName: 'li',
	classNames: ['clearfix', 'part-element'],
	classNameBindings:[
		'partElement.isSelected:selected',
		'partElement.displayed::not-displayed'],
	selectorHighlighter: Ember.inject.service(),
	selectorInspector: Ember.inject.service(),
	inspectElement(){
		let selectorInspector = this.get('selectorInspector');
		let isXpath = this.get('partElement.foundByXpath');
		if(isXpath){
			selectorInspector.inspectXpath(
				this.get('partElement.part.fullXpath'), 
				this.get('partElement.iframeIndex'), 
				this.get('partElement.elementIndex'));
		}else{
			selectorInspector.inspectCss(
				this.get('partElement.part.fullCss'), 
				this.get('partElement.iframeIndex'), 
				this.get('partElement.elementIndex'));
		}
	},
	highlightElement(){
		let selectorHighlighter = this.get('selectorHighlighter');
		let isXpath = this.get('partElement.foundByXpath');
		if(isXpath){
			selectorHighlighter.highlightXpath(
				this.get('partElement.part.fullXpath'), 
				this.get('partElement.iframeIndex'),
				this.get('partElement.elementIndex'));
		}else{
			selectorHighlighter.highlightCss(
				this.get('partElement.part.fullCss'),
				this.get('partElement.iframeIndex'),
				this.get('partElement.elementIndex'));
		}
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
		}
	}
});
