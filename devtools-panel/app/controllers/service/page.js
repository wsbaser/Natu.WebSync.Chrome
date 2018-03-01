import Ember from 'ember';

export default Ember.Controller.extend({
	vsclient: Ember.inject.service(),
	selectorValidator: Ember.inject.service(),
	selectorHighlighter: Ember.inject.service(),
	selectorBuilder: Ember.inject.service(),
	applicationCtrl: Ember.inject.controller('application'),
	skipLoading: true,
	highlightInner:false,
	plugins: "wholerow, types, state",
    themes: {
        name: 'default',
        dots: true,
        icons: true,
        stripes: true
    },
    stateOptions:{
    	"key" : "websync",
    	"filter": function(state){
    		console.log(state);
    		return state;
    	}
    },
    typesOptions: {
    	"web-page" : {
			"valid_children" : ['web-element','default']
		},
    	"web-element" : {
        	"icon" : "jstree-file",
        	"valid_children" : []
		}
	},
    data: null,
    init(){
    	this.set('highlightInner', localStorage.highlightInner);
    },
	rebuildTree(){
		this.recalculateTreeData();
		// this.validateTreeSelectors();
		//this.redrawTree();
	},
	recalculateTreeData(){	
		let page = this.get('model');
		let data = this.iteratePages(page);
		this.set('data', data);
		return data;
	},
	iteratePages(page){
		let nodes = [];
		if(page){
			let basePage = page.get('basePageType').content;
			let basePageComponentNodes = this.iteratePages(basePage);
			nodes = nodes.concat(basePageComponentNodes);

			let pageId = page.get('id'); 
			let components = page.get('components').toArray();
			let componentNodes = this.iterateComponents(pageId, null, components);
			let pageNode = {
					id: pageId,
					// parent: '#',
					text:  page.get('name'),
					type: 'web-page',
					children: componentNodes
				};
			nodes.push(pageNode);
		}
		return nodes;
	},
	iterateComponents(parentId, parentRootSelector, components){
		let nodes=[];
		if(components){
			let selectorBuilder = this.get('selectorBuilder');
			for (let i = components.length - 1; i >= 0; i--) {
				let componentId = components[i].id;
				let componentName = components[i].get('name');
				let rootSelector = components[i].get('rootSelector');
				let fullRootSelector = selectorBuilder.innerSelector(parentRootSelector, rootSelector);
			    let rootScss = (rootSelector ? rootSelector.scss : null);
				let childNodes = this.iterateComponents(componentId, fullRootSelector, components[i].get('componentType.components').toArray());
				let baseTypeNodes = this.iterateComponents(componentId, fullRootSelector, components[i].get('componentType.baseComponentType.components').toArray());
				childNodes = childNodes.concat(baseTypeNodes);
				nodes.push({
					id: parentId +'.'+ componentId,
					text:  componentName + ' (' + rootScss + ')',
					rootSelector: rootSelector,
					fullRootSelector: fullRootSelector,
					type: components[i].get( 'componentType.isWebElement') ? 'web-element' : 'default',
					children: childNodes
				});
				// TODO: remove this
				// var component = this.get('store').peekRecord('component', componentId);
				// component.set('fullRootSelector', fullRootSelector);
			}
		}
		return nodes;
	},
	getTreeNode(id){
		return this.get('jstreeObject').jstree(true).get_node(id);
	},
	getRootTreeNode(id){
		return this.getTreeNode("#");
	},
	validateTreeSelectors(){
		var rootNode = this.getRootTreeNode();
		this.validateChildrenNodeSelectors(rootNode);
	},
	validateChildrenNodeSelectors(node){
		node.children.forEach(childId=>{
			let childNode = this.getTreeNode(childId);
			this.validateNodeSelector(childNode);
		});
	},
	validateNodeSelector(node){
		if(this.isComponent(node)){
			console.log(node.id);
			let selectorValidator = this.get('selectorValidator');	
			selectorValidator.validate(node.original.fullRootSelector).then(function(validationData){
				this.setComponentNodeValidationStatus(node.id, validationData);
			}.bind(this));
		}
		if(node.state.opened){
			this.validateChildrenNodeSelectors(node);
		}
	},
	highlightChildrenNodes(node){
		node.children.forEach(childId=>{
			let childNode = this.getTreeNode(childId);
			this.highlightNode(childNode);
		});
	},
	highlightNode(node){
		if(this.isComponent(node)){
			this.get('selectorHighlighter').highlight(node.original.fullRootSelector);
		}
		if(this.get('highlightInner')){
			this.highlightChildrenNodes(node);
		}
	},
	isComponent(node){
		return node.type==='default' || node.type==='web-element';
	},
	setComponentNodeValidationStatus(nodeId, validationData){
		let nodeElement = document.getElementById(nodeId+"_anchor");
		Array.from(nodeElement.classList).forEach(item=>{
			if(item.startsWith('natu-')){
				nodeElement.classList.remove(item);
			}
		});
		this._getValidationClass(validationData).forEach(_class=>{
			nodeElement.classList.add(_class);
		});
	},
	_getValidationClass(validationData){
		var _class;
		var getClass = function(selectorValidationData){
			let result = [];
			result.push(selectorValidationData.count===1 ? 
				'natu-one-node' :
				(selectorValidationData.count>0?'natu-several-nodes':'natu-no-nodes'));
			if(selectorValidationData.displayedCount<selectorValidationData.count){
				result.push('natu-has-hidden');
			}
			return result;
		};
		if(!validationData){
			_class =['natu-not-specified'];
		}
		else if(validationData.css.isValid){
			_class = getClass(validationData.css);
		}else if(validationData.xpath.isValid){
			_class = getClass(validationData.xpath);
		}else{
			_class = ['natu-invalid'];
		}
		return _class;
	},
	// redrawTree(){
	// 	var actionReceiver = this.get('jstreeActionReceiver');
	// 	if(actionReceiver){
	// 		actionReceiver.send('redraw');
	// 	}
	// },
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
			if(node.type!=='web-page'){
				var fullRootSelector = node.original.fullRootSelector;
				this.set('applicationCtrl.inputValue', fullRootSelector ? fullRootSelector.scss : "");
				// this.set('applicationCtrl.targetCss', node.original.fullRootSelector.css);
				// this.set('applicationCtrl.targetXPath', node.original.fullRootSelector.xpath);
				// TODO: trigger selector changed action
				//this.actions.onSourceSelectorChanged.call(this, rootScss);
			}
		},
		onComponentNodeHovered(node){
			this.highlightNode(node);
		},
		onOpenComponentNode(node){
			this.validateNodeSelector(node);
		},
		onComponentNodeDehovered(){
			this.get('selectorHighlighter').removeHighlighting();
		},
		onHighlightInnerComponents(){
			this.toggleProperty('highlightInner');
			localStorage.highlightInner = this.get('highlightInner');
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