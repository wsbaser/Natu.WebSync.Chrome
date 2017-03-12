import Ember from 'ember';

export default Ember.Route.extend({
	vsclient: Ember.inject.service(),
	beforeModel(){
		var vsclient = this.get('vsclient');
		vsclient.connect();

		this.pushTestPayload();
	},
	model(){
		var services = this.store.peekAll('service');
		if(services.get('length')==0){
			var pageIds = this.store.peekAll('page-type').toArray().map(p=>p.id);
			this.store.pushPayload({
				services: [{
					id: 'SpikeService',
					pages: pageIds
				}]
			});
			services = this.store.peekAll('service');
		}
		return services;
	},
	afterModel(){
		// . Match current url to service and redirect to it
	},
	pushTestPayload(){
		// this.store.pushPayload({
		// 	services: [{
		// 		id: 'AirbnbService',
		// 		pages: ['MainPage','SearchApartmentPage', 'ApartmentPage']
		// 	}]
		// });

		this.store.pushPayload({
			pageTypes: [
				{
					id:'MainPage',
					absolutePath: '',
					components:['MainPage.SearchForm']
				},
				{
					id:'SearchApartmentPage',
					absolutePath: 's/{place}',
					components: ['SearchApartmentPage.FiltersWidget']
				},
				{
					id:'ApartmentPage',
					absolutePath: '/rooms/{roomId}',
					components: ['ApartmentPage.ApartmentSummary']
				}
			]
		});

		this.store.pushPayload({
			componentTypes:[{
				id:'mynamespace.SearchForm',
				components:[
					'SearchForm.SearchLocation'
				]
			},
			{
				id:'mynamespace.FiltersWidget',
				components:[
					'FiltersWidget.CheckinDate'
				]
			},
			{
				id:'mynamespace.ApartmentSummary',
				components:[
					'ApartmentSummary.HostProfileImage',
				]				
			},
			{
				id: 'natunamespace.WebInput'
			},
			{
				id: 'natunamespace.WebIcon'
			}]
		});

		this.store.pushPayload({
			components:[
				{
					id: 'MainPage.SearchForm',
					componentType:'mynamespace.SearchForm',
					name: 'Search Form',
					rootScss: '.SearchForm'
				},
				{
					id: 'SearchApartmentPage.FiltersWidget',
					componentType:'mynamespace.FiltersWidget',
					name: 'Filters',
					rootScss: '.filters'
				},
				{
					id: 'ApartmentPage.ApartmentSummary',
					componentType:'mynamespace.ApartmentSummary',
					name: 'Apartment Summary',
					rootScss: '#summary'
				},
				{
					id: 'SearchForm.SearchLocation',
					componentType: 'natunamespace.WebInput',
					name: 'Search Location',
					rootScss: '#search-location'
				},
				{
					id: 'FiltersWidget.CheckinDate',
					componentType: 'natunamespace.WebInput',
					name: 'Checkin Date',
					rootScss: '#datespan-checkin'
				},
				{
					id: 'ApartmentSummary.HostProfileImage',
					componentType: 'natunamespace.WebIcon',
					name: 'Host Profile Image',
					rootScss: '.host-profile-image'
				}
		]});
	}
});