import Ember from 'ember';

export default Ember.Controller.extend({
	applicationCtrl: Ember.inject.controller('application'),
	selectorValidator: Ember.inject.service(),
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
		return data;
	},
	validateTreeSelectors(){
		var data = this.get('data', data);
		data.forEach(treeNode=>this.validateTreeSelector(treeNode));
	},
	validateTreeSelector(treeNode){
		var selectorValidator = this.get('selectorValidator');
		selectorValidator.validate(treeNode.rootScss).then(function(validationData){
			treeNode.a_attr = this._generateNodeParams(validationData);
			this.get('jstreeActionReceiver').send('redraw');
		}.bind(this));
	},
	_generateNodeParams(validationData){
		var _class;
		var getClass = function(selectorValidationData){
			return selectorValidationData.count===1 ? 
				'one-node' :
				(selectorValidationData.count>0?'several-nodes':'no-nodes');
		};
		if(validationData.css.isValid){
			_class = getClass(validationData.css);
		}else if(validationData.xpath.isValid){
			_class = getClass(validationData.xpath);
		}else{
			_class = 'invalid'; 
		}
		return {class:_class};
	},
	_getNodeValidationClass(validationData){

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