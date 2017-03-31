import Ember from 'ember';

export default Ember.Controller.extend({
	vsclient: Ember.inject.service(),
	selectorValidator: Ember.inject.service(),
	selectorHighlighter: Ember.inject.service(),
	selectorBuilder: Ember.inject.service(),
	applicationCtrl: Ember.inject.controller('application'),
	plugins: "wholerow, types",
    themes: {
        name: 'default',
        dots: true,
        icons: true
    },
    typesOptions: {
    	'web-element' : {
        	"icon" : "jstree-file",
        	"valid_children" : []
		}
	},
    data: null,
	addEventHandlers(){
		var vsclient = this.get('vsclient');
		vsclient.on("SessionWebData", this.rebuildTree.bind(this));	
	},
	rebuildTree(){
		this.recalculateTreeData();
		this.validateTreeSelectors();
		this.redrawTree();
	},
	recalculateTreeData(){
		var page = this.get('model');
		let data = [];
		let pageId = page.get('id'); 
		let pageNode = {
				id: pageId,
				parent: '#',
				text:  page.get('name'),
				type: 'web-page'
			};
		var components = page.get('components').toArray();
		data = this.iterateComponents(pageId, null, components);
		this.set('data', data);
		return data;
	},
	iterateComponents(parentId, parentRootSelector, components){
		var nodes=[];
		if(components){
			var selectorBuilder = this.get('selectorBuilder');
			for (var i = components.length - 1; i >= 0; i--) {
				var componentId = components[i].id;
				var componentName = components[i].get('name');
				var rootSelector = components[i].get('rootSelector');
				var fullRootSelector = selectorBuilder.innerSelector(parentRootSelector, rootSelector);
			    var rootScss = (rootSelector ? rootSelector.scss : null);
				nodes.push({
					id: componentId,
					parent: parentId||'#',
					text:  componentName + ' (' + rootScss + ')',
					rootSelector: rootSelector,
					fullRootSelector: fullRootSelector,
					type: components[i].get( 'componentType.isWebElement') ? 'web-element' : 'default'
				});
				// TODO: remove this
				// var component = this.get('store').peekRecord('component', componentId);
				// component.set('fullRootSelector', fullRootSelector);
				var childNodes = this.iterateComponents(componentId, fullRootSelector, components[i].get('componentType.components').toArray());
				nodes = nodes.concat(childNodes);
			}
		}
		return nodes;
	},
	validateTreeSelectors(){
		var data = this.get('data', data);
		data.forEach(treeNode=>this.validateTreeSelector(treeNode));
	},
	validateTreeSelector(treeNode){
		var selectorValidator = this.get('selectorValidator');
		selectorValidator.validate(treeNode.fullRootSelector).then(function(validationData){
			treeNode.a_attr = this._generateNodeParams(validationData);
			this.redrawTree();
		}.bind(this));
	},
	_generateNodeParams(validationData){
		var _class;
		var getClass = function(selectorValidationData){
			return selectorValidationData.count===1 ? 
				'one-node' :
				(selectorValidationData.count>0?'several-nodes':'no-nodes');
		};
		if(!validationData){
			_class = 'not-specified';
		}
		else if(validationData.css.isValid){
			_class = getClass(validationData.css);
		}else if(validationData.xpath.isValid){
			_class = getClass(validationData.xpath);
		}else{
			_class = 'invalid'; 
		}
		return {class:_class};
	},
	redrawTree(){
		var actionReceiver = this.get('jstreeActionReceiver');
		if(actionReceiver){
			actionReceiver.send('redraw');
		}
	},
	expandAllTreeNodes(){
		this.get('jstreeActionReceiver').send('openAll');
	},
	collapseAllTreeNodes(){
		this.get('jstreeActionReceiver').send('closeAll');
	},
	getComponentById(id){
		return this.get('store').peekRecord('component', id);
	},
	actions:{
		onComponentNodeSelected(node){
			var fullRootSelector = node.original.fullRootSelector;
			this.set('applicationCtrl.inputValue', fullRootSelector ? fullRootSelector.scss : "");
			// TODO: trigger selector changed action
			// this.actions.onSourceSelectorChanged.call(this, rootScss);
		},
		onComponentNodeHovered(node){
			this.get('selectorHighlighter').highlight(node.original.fullRootSelector);
		},
		onComponentNodeDehovered(){
			this.get('selectorHighlighter').removeHighlighting();			
		},
		onExpandAllTreeNodes(){
			this.expandAllTreeNodes();
		},
		onCollapseAllTreeNodes(){
			this.collapseAllTreeNodes();
		},
		onRefreshTree(){
			var vsclient = this.get('vsclient');
			vsclient.sendSessionWebRequest();
		},
		onRevalidateTreeSelector(){
			this.validateTreeSelectors();
		}
	}
});