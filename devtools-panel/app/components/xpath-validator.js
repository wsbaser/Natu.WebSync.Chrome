import Ember from 'ember';
import SelectorValidator from './selector-validator';

export default SelectorValidator.extend({
  	validate: Ember.observer('value', function() {
		var value = this.get('value');
		this.evaluateSelector('evaluateXpath("' + value + '")');
  	})
});