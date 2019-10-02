import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('element-attribute', 'Integration | Component | element attribute', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{element-attribute}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#element-attribute}}
      template block text
    {{/element-attribute}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
