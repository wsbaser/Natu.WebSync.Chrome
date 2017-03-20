import Ember from 'ember';

export default Ember.Controller.extend({
	vsclient: Ember.inject.service(),
	selectorValidator: Ember.inject.service(),
	selectorHighlighter: Ember.inject.service(),
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
		if(page){
			var data = [];
			var components = page.get('components').toArray();
			data = this.iterateComponents(null, null, components);
			this.set('data', data);
			return data;
		}
	},
	iterateComponents(parentId, parentRootScss, components){
		var nodes=[];
		if(components){
			for (var i = components.length - 1; i >= 0; i--) {
				var componentId = components[i].id;
				var componentName = components[i].get('name');
				var rootScss = components[i].get('rootScss');
				var fullRootScss = rootScss && rootScss.startsWith("root:")?
                	this.innerScss(parentRootScss, rootScss.replace("root:", '')):
            		rootScss;
				nodes.push({
					id: componentId,
					parent: parentId||'#',
					text:  componentName + ' (' + rootScss + ')',
					rootScss: rootScss,
					fullRootScss: fullRootScss
				});
				// TODO: remove this
				var component = this.get('store').peekRecord('component', componentId);
				component.set('fullRootScss', fullRootScss);
				var childNodes = this.iterateComponents(componentId, fullRootScss, components[i].get('componentType.components').toArray());
				nodes = nodes.concat(childNodes);
			}
		}
		return nodes;
	},
	innerScss(rootScss, relativeScss){
		if(rootScss && relativeScss){
			return rootScss.trim() + ' ' + relativeScss.trim();
		}
		else if(rootScss){
			return rootScss;
		}
		else if(relativeScss){
			return relativeScss;
		}
		return null;
	},
	validateTreeSelectors(){
		var data = this.get('data', data);
		data.forEach(treeNode=>this.validateTreeSelector(treeNode));
	},
	validateTreeSelector(treeNode){
		var selectorValidator = this.get('selectorValidator');
		selectorValidator.validate(treeNode.fullRootScss).then(function(validationData){
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
		if(validationData.css.isValid){
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
			var component = this.getComponentById(node.id);
			var fullRootScss = component.get('fullRootScss');
			this.set('applicationCtrl.inputValue', fullRootScss);
			// TODO: trigger selector changed action
			// this.actions.onSourceSelectorChanged.call(this, rootScss);
		},
		onComponentNodeHovered(node){
			var component = this.getComponentById(node.id);
			var fullRootScss = component.get('fullRootScss');
			this.get('selectorHighlighter').highlight(fullRootScss);
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