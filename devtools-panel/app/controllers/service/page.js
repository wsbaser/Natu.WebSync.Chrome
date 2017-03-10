import Ember from 'ember';

export default Ember.Controller.extend({
	applicationCtrl: Ember.inject.controller('application'),
	plugins: "wholerow, types",
    themes: {
        name: 'default',
        responsive: true,
        dots: true,
        icons: true
    },
    typesOptions: {
        'single-child': {
            'max_children': '1'
        }
    },
    data: null,
	recalculateTreeData(){
		var page = this.get('model');
		var data = [];
		var components = page.get('components').toArray();
		data = this.iterateComponents(null, components);
		this.set('data', data);
	},
    iterateComponents(parentId, components){
		var nodes=[];
		if(components){
			for (var i = components.length - 1; i >= 0; i--) {
				var componentId = components[i].id;
				var componentName = components[i].get('name');
				var rootScss = components[i].get('rootScss');
				nodes.push({
					id: componentId,
					parent: parentId||'#',
					text:  componentName + ' (' + rootScss + ')',
					rootScss: rootScss
				});
				var childNodes = this.iterateComponents(componentId, components[i].get('componentType.components').toArray());
				nodes = nodes.concat(childNodes);
			}
		}
		return nodes;
	},
	actions:{
		onComponentNodeSelected(node){
			var component = this.get('store').peekRecord('component', node.id);
			var rootScss = component.get('rootScss');
			this.set('applicationCtrl.inputValue', rootScss);
			// TODO: trigger selector changed action
			// this.actions.onSourceSelectorChanged.call(this, rootScss);
		}
	}
});