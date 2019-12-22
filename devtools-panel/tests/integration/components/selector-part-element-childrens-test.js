import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('selector-part-element-childrens', 'Integration | Component | selector part element childrens', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{selector-part-element-childrens}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#selector-part-element-childrens}}
      template block text
    {{/selector-part-element-childrens}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
