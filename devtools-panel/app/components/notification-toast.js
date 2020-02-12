import Component from '@ember/component';

export default Component.extend({
	tagName: 'div',
	classNames: ['notification'],
	classNameBindings:[
		'notification.isError:error'
	]
});
