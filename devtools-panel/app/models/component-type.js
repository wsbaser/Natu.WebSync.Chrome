import DS from 'ember-data';
import { hasMany } from 'ember-data/relationships';

export default DS.Model.extend({
	baseComponentType: belongsTo('component-type', { inverse: null }),
	components: hasMany('component', { inverse: null }),
	allComponents: Ember.computed('components.[]', 'baseComponentType.components.[]', function(){
	  	var components = this.get('components');
	  	var baseComponents = this.get('baseComponentType.components') || [];
	  	return components.concat(baseComponents);
	})
});
