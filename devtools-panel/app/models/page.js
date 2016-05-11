import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
  absolutePath: attr('string'),
  service: belongsTo('service'),
  elements: hasMany('element'),
  component: hasMany('component')
});