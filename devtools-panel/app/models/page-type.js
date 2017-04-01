import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';
import Ember from 'ember';

export default Model.extend({
  basePageType: belongsTo('page-type', { inverse: null }),
  absolutePath: attr('string'),
  components: hasMany('component'),
  name: Ember.computed('id', function(){
  	let id = this.get('id');
  	let arr = id.split('.');
  	return arr[arr.length-1];
  })
});