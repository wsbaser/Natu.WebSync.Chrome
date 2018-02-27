import Ember from 'ember';

export default Ember.Route.extend({
	vsclient: Ember.inject.service('vsclient'),
	backgroundConnection: Ember.inject.service('background-connection'),
	// beforeModel(){
	// 	// setTimeout(function(){
	// 	// 	console.log("push payload");
	// 	// 	this.pushTestPayload();
	// 	// }.bind(this), 3000);
	// },
	model(params){
		return this.store.peekRecord('service', params.service_id);
	},
	afterModel(model){
		if(model){
			localStorage.currentService = model.id;
		}
	},
	setupController(controller, model){
		this._super(controller, model);
		controller.set('services', this.store.peekAll('service'));

		chrome.devtools.inspectedWindow.eval(
	      "getCurrentUrl()",
	      { useContentScriptContext: true },
	      function(result, isException) {
	     	controller.set('currentUrl', result.href);
	      });

		var backgroundConnection = this.get('backgroundConnection');
		backgroundConnection.on("urlchanged", function(data){
			controller.set('currentUrl', data.url);
		}.bind(this));


		var vsclient = this.get('vsclient');
		vsclient.on("SessionWebData", this.invalidateRoute.bind(this));
	},
	redirect(model, transition){
		this.transitionToCurrentPage();
	},
	transitionToCurrentPage(serviceModel){
		if(serviceModel){
			var urlMatchResult = this.controllerFor('application').get('urlMatchResult');
			var pageIdToRedirect = urlMatchResult ? urlMatchResult.PageId: localStorage.currentPage;
			var currentPage = serviceModel.get('pages').findBy('id', pageIdToRedirect);
			if(currentPage){
				this.transitionTo('service.page', currentPage);
			}
		}
	},
	invalidateRoute(){
		var currentServiceModel = this.controller.get('model');
		var newServiceModel = this.store.peekAll('service').findBy('id', localStorage.currentService);
		if(currentServiceModel){
			if(newServiceModel){
				// . service did not change. update page.
				this.transitionToCurrentPage(newServiceModel);

			}else{
				// . service dissapeared
				this.transitionTo('service', '');
			}
		}else if(newServiceModel){
			// . received service
			this.transitionTo('service', newServiceModel);
		}
	}
});