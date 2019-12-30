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
			let level = this.get('partElement.level')||0;
			this.$('.selection').css('marginLeft', '-'+(43+12*level)+'px');
    	});
	},
	getElementSelector(){
		return this.get('partElement').getSelector();
	},
	click(){
		if(window.event.cancelBubble){
			return;
		}
		this.inspectElement();
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
	inspectElement(){
		this.get('selectorInspector').inspect(this.getElementSelector());
	},
	highlightElement(){
		this.get('selectorHighlighter').highlight(this.getElementSelector());
	},
	loadChildren(){
		this.get('selectorHighlighter').loadChildren(this.getElementSelector(), this.onChildrenLoaded.bind(this));
	},
	onChildrenLoaded(result, exception){
		let children = this.get('selectorPartFactory').generateChildElements(this.get('partElement'), result);
		this.set('partElement.children', children);
	},
	actions:{
		// onInspectElement(element){
		// 	if(window.event.cancelBubble){
		// 		return;
		// 	}
		// 	this.inspectElement();
		// 	let onSelected = this.get('onSelected');
		// 	if(onSelected){
		// 		onSelected(element);
		// 	}
		// },
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
			window.event.stopPropagation();
			return false;
		}
	}
});
