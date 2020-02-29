import Ember from 'ember';

export default Ember.Route.extend({
	model(){
		//this.pushTestPayload();
	},
	pushTestPayload(){
		this.store.pushPayload({
			services: [{
				id: 'AirbnbService',
				pages: ['MainPage','SearchApartmentPage', 'ApartmentPage']
			}]
		});
		this.store.pushPayload({
			pageTypes: [
				{
					id: 'AirBnbPageBase',
					components: ['AirBnbPageBase.LogoIcon']
				},
				{
					id:'MainPage',
					basePageType: 'AirBnbPageBase',
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
					'SearchForm.SearchLocation',
					'SearchForm.CheckinDate',
					'SearchForm.CheckoutDate',
					'SearchForm.SearchButton'
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
				id: 'natunamespace.WebButton'
			},
			{
				id: 'natunamespace.WebIcon'
			}]
		});

		this.store.pushPayload({
			components:[
				{
					id: 'AirBnbPageBase.LogoIcon',
					componentType: 'natunamespace.WebIcon',
					name: 'AirBnb Logo Icon',
					rootSelector: {
						scss: '.icon-airbnb-alt',
						css: '.icon-airbnb-alt',
						xpath: '//*[contains(@class,"icon-airbnb-alt")]'
					}
				},
				{
					id: 'MainPage.SearchForm',
					componentType: 'mynamespace.SearchForm',
					name: 'Search Form',
					rootSelector: {
						scss: '.SearchForm',
						css: '.SearchForm',
						xpath: '//*[contains(@class,"SearchForm")]'
					}
				},
				{
					id: 'SearchApartmentPage.FiltersWidget',
					componentType:'mynamespace.FiltersWidget',
					name: 'Filters',
					rootSelector: {
						scss: '.filters',
						css: '.filters',
						xpath: '//*[contains(@class,"filters")]'
					}
				},
				{
					id: 'ApartmentPage.ApartmentSummary',
					componentType:'mynamespace.ApartmentSummary',
					name: 'Apartment Summary',
					rootSelector: {
						scss: '#summary',
						css: '#summary',
						xpath: '//*[@id="summary"]'
					}
				},
				{
					id: 'SearchForm.SearchLocation',
					componentType: 'natunamespace.WebInput',
					name: 'Search Location',
					rootSelector: null
				},
				{
					id: 'SearchForm.CheckinDate',
					componentType: 'natunamespace.WebInput',
					name: 'Checkin Date',
					rootSelector: {
						css: '#startDate',
						scss: '#startDate',
						xpath: '//*[@id="startDate"]'
					}
				},
				{
					id: 'SearchForm.CheckoutDate',
					componentType: 'natunamespace.WebInput',
					name: 'Checkout Date',
					rootSelector: {
						scss: '#endDate',
						css: '#endDate',
						xpath: '//*[@id="endDate"]'
					}
				},
				{
					id: 'SearchForm.SearchButton',
					componentType: 'natunamespace.WebButton',
					name: 'Search',
					rootSelector: {
						scss: '.SearchForm__submit>button',
						css: '.SearchForm__submit>button',
						xpath: '//*[contains(@class, "SearchForm__submit")]/button'
					}
				},
				{
					id: 'FiltersWidget.CheckinDate',
					componentType: 'natunamespace.WebInput',
					name: 'Checkin Date',
					rootSelector: {
						scss: '#datespan-checkin',
						css: '#datespan-checkin',
						xpath: '//*[@id="datespan-checkin"]'
					}
				},
				{
					id: 'ApartmentSummary.HostProfileImage',
					componentType: 'natunamespace.WebIcon',
					name: 'Host Profile Image',
					rootSelector: {
						scss: '.host-profile-image',
						css: '.host-profile-image',
						xpath: '//*[contains(@class, ".host-profile-image")]'
					}
				}
		]});
		//this.invalidateRoute();
	},
	redirect(model, transition){
		this.transitionTo('index');
	},
	actions:{
		makeRoot(model){
			this.controller.makeRoot(model);
		},
		deletePart(model){
			this.controller.removePart(model);
		}
	}
});