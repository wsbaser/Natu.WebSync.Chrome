import Ember from 'ember';

export default Ember.Controller.extend({
	vsclient: Ember.inject.service('vsclient'),
	pages: Ember.computed.alias('model.pages'),
	pagesSorting: ['id:desc'],
	sortedPages: Ember.computed.sort('pages','pagesSorting'),
	applicationCtrl: Ember.inject.controller('application'),
	pageCtrl: Ember.inject.controller('service.page'),
	currentUrl: null,
	urlMatchResult: null,
	urlMatchResultObserver: Ember.observer("applicationCtrl.urlMatchResult", function(){
		var urlMatchResult = this.get("applicationCtrl.urlMatchResult");
		if(urlMatchResult != null) {
			this.transitionToRoute('service.page', 'SpikeService', urlMatchResult.PageId);
		}
	}),
	currentUrlObserver: Ember.observer("currentUrl", function(){
		var vsclient = this.get('vsclient');
		var currentUrl = this.get('currentUrl');
		vsclient.matchUrl(currentUrl).then(urlMatchResult=>{
			this.set('applicationCtrl.urlMatchResult', urlMatchResult);
		});
	})
});
