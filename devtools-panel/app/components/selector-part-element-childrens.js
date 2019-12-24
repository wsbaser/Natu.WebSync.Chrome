import Component from '@ember/component';

export default Component.extend({
	tagName: 'ul',
	classNames: ['clearfix', 'children'],
	classNameBindings:['partElement.isExpanded:expanded']
});
