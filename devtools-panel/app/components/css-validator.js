import Ember from 'ember';
import SelectorValidator from './selector-validator';
import SelectorPart from '../models/selector-part';

export default SelectorValidator.extend({
	validate: Ember.observer('value', function() {
		var value = this.get('value');
		var part = SelectorPart.create({
			selector:value,
			fullSelector:value
		});
		this.set('parts', [part]);
		this.validateSelectorPart(part, 'evaluateCss("'+value+'")');
  	})
});
