import Ember from 'ember';
import SelectorValidator from './selector-validator';

export default SelectorValidator.extend({
  	validate: Ember.observer('value', function() {
		var value = this.get('value');
		var parts = this.splitToParts(value, ['/']);
		this.set('parts', parts);
		parts.forEach(function(part){
			this.validateSelectorPart(part,'evaluateXpath("' + part.get('fullSelector') + '")');
		}.bind(this));
  	})
});