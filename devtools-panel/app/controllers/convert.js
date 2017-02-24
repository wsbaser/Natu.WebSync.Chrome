import Ember from 'ember';

export default Ember.Controller.extend({
	applicationCtrl: Ember.inject.controller('application'),
	services: Ember.computed.alias('applicationCtrl.model'),
	vsclient: Ember.inject.service('vsclient'),
	init(){
		console.log("Init ConvertController...");
		var vsclient = this.get('vsclient');
		vsclient.on("ConvertedSelector", this.onTargetSelectorReceived.bind(this));
	},
	data: Ember.computed('services', function(){
		var firstService = this.get('services').toArray()[0];
		var firstPage = firstService.get('pages').toArray()[0];
		var components = firstPage.get('components').toArray();
		return this.iterateComponents(components);
	}),
	iterateComponents(components){
		var nodes=[];
		if(components){
			for (var i = components.length - 1; i >= 0; i--) {
				nodes.push({
					id: components[i].get('id'),
					parent: components[i].get('parent.id')
				});
				var childNodes = this.iterateComponents(components[i].get('type.components').toArray());
				nodes = nodes.concat(childNodes);
			}
		}
		return nodes;
	},
	plugins: "wholerow, types",
    themes: {
        'name': 'default',
        'responsive': true
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
		}
	}
});
