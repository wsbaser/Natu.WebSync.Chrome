import Component from '@ember/component';

export default Component.extend({
	tagName: 'li',
	classNames: ['clearfix', 'part-element'],
	classNameBindings:[
		'partElement.isSelected:selected',
		'partElement.displayed::not-displayed'],
	selectorHighlighter: Ember.inject.service(),
	selectorInspector: Ember.inject.service(),
	actions:{
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
		}
	}
});
