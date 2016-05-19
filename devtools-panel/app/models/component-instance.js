import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({
  componentType: attr('string'),
  name: attr('string'),
  rootScss: attr('string'),
  page: belongsTo('page'),
  parentComponent: belongsTo('component'),
  constructorParams: attr()
});