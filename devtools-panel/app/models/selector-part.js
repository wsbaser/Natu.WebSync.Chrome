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
	}),
	selectorsEqualTo(part){
		return this.get('fullXpath')==part.get('fullXpath') && 
			this.get('fullCss')==part.get('fullCss');
	},
	copySelectorsFrom(part){
		this.set('fullXpath', part.get('fullXpath'));
		this.set('fullCss', part.get('fullCss'));

		this.set('css', part.get('css'));
		this.set('xpath', part.get('xpath'));

		this.set('scss', part.get('scss'));
	}
});