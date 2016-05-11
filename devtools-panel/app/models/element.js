import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({
  type: attr('string'),
  rootScss: attr('string'),
  name: attr('string'),
  page: belongsTo('page'),
  typeFullName: attr('string'),
  params: attr()
});