import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({
  type: belongsTo('componentType'),
  parent: belongsTo('component'),
  page: belongsTo('page'),
  name: attr('string'),
  rootScss: attr('string'),
  constructorParams: attr()
});