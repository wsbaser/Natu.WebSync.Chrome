import Ember from 'ember';
import ScssBuilder from '../services/scss-builder';

export default Ember.Object.extend({
	// viewableElements: Ember.computed('elements', function(){
	// 	var elements = this.get('elements');
	// 	console.log("Update viewable elements");
	// 	console.log(elements);
	// }),
	// fullSelectorObj: Ember.computed('fullSelector', function(){
	// 	return {
	// 		css: this.get('fullCss'),
	// 		xpath: this.get('fullXpath')
	// 	};
	// }),
	isBlank: Ember.computed('scss', function(){
		return !this.get('scss');
	})
});