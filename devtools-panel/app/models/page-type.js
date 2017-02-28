import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
  basePageType: belongsTo('page-type', { inverse: null }),
  absolutePath: attr('string'),
  components: hasMany('component')
});