import Model from 'ember-data/model';
import { hasMany } from 'ember-data/relationships';

export default Model.extend({
  elements: hasMany('elementInstance'),
  components: hasMany('componentInstance')
});