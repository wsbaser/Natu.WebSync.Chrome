import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({
  componentType: belongsTo('component-type', { inverse: null }),
  name: attr('string'),
  rootScss: attr('string'),
  constructorParams: attr()
});