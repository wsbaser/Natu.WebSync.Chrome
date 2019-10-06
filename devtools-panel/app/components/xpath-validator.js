import Ember from 'ember';
import SelectorValidator from './selector-validator';

export default SelectorValidator.extend({
	scssBuilder: Ember.inject.service(),
  	validate: Ember.observer('parts', function() {
  		var parts = this.get('parts');
  		parts.forEach(function(part){
  			this.validateSelectorPart(part, 'evaluateXpath("' + part.get('fullXpath') + '")');
  		}.bind(this));
  	})
});