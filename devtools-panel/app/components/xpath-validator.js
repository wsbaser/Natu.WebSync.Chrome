import Ember from 'ember';
import SelectorValidator from './selector-validator';
import SelectorPart from '../models/selector-part';
import {A} from '@ember/array';

export default SelectorValidator.extend({
  	validate: Ember.observer('scss', function() {
  		var scss = this.get('scss');
  		var selectorParts = this.generateSelectorParts(scss.parts);
  		this.set('parts', selectorParts);
  		selectorParts.forEach(function(selectorPart){
  			this.validateSelectorPart(selectorPart,'evaluateXpath("' + selectorPart.get('fullSelector') + '")');
  		}.bind(this));
  	}),
	generateSelectorParts(scssParts){
		return A(scssParts.map(scssPart=>
			SelectorPart.create({
					isXPath: true,
					id: scssPart.id,
					tagName: scssPart.tagName,
					classNames: A(scssPart.classNames),
					texts: scssPart.texts,
					selector: scssPart.xpath,
					fullSelector: scssPart.fullXpath,
					index: scssPart.index
				})));
	}
});