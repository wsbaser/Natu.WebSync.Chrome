import Ember from 'ember';

export default Ember.Controller.extend({
	applicationCtrl: Ember.inject.controller('application'),
	services: Ember.computed.alias('applicationCtrl.model'),
	pages: Ember.computed.alias('model'),
	vsclient: Ember.inject.service('vsclient'),
	inputValue:'',
	init(){
		console.log("Init ConvertController...");
		var vsclient = this.get('vsclient');
		vsclient.on("ConvertedSelector", this.onTargetSelectorReceived.bind(this));
	},
	data: null,
	currentPage: Ember.computed('pages.[]', function(){
		var pages = this.get('pages').toArray();
		var currentPage = pages.length? pages[0]: null;
		this.recalculateTreeData(currentPage);
		return currentPage;
	}),
	recalculateTreeData(page){
		var data = [];
		if(page){
			var components = page.get('components').toArray();
			data = this.iterateComponents(null, components);
		}
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

	onTargetSelectorReceived(json){
		var data = JSON.parse(json);
		this.set('targetScss', data.Scss);
		this.set('targetCss', data.Css);
		this.set('targetXPath', data.XPath);
	},
	actions:{
		selectPage(page){
			this.recalculateTreeData(page);
		},
		onSourceSelectorChanged: function(selector) {
			var vsclient = this.get('vsclient');
			console.log('KeyUp');
			if(vsclient.get("isConnected")){
				vsclient.convertSelector(selector);
			}
			else{
				console.log('Convertion service not available. Using selector without conversion.');
				this.set('targetCss', selector);
				this.set('targetXPath', selector);
			}
		},
		onComponentNodeSelected(node){
			var component = this.get('store').peekRecord('component', node.id);
			var rootScss = component.get('rootScss');
			this.set('inputValue', rootScss);
			this.actions.onSourceSelectorChanged.call(this, rootScss);
		}
	}
});
