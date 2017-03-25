import Ember from 'ember';

export default Ember.Route.extend({
	beforeModel(){
		this.pushTestPayload();
	},
	model(){
		return this.store.peekAll('service');
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
					id: 'SearchForm.CheckinDate',
					componentType: 'natunamespace.WebInput',
					name: 'Checkin Date',
					rootScss: '#startDate'
				},
				{
					id: 'SearchForm.CheckoutDate',
					componentType: 'natunamespace.WebInput',
					name: 'Checkout Date',
					rootScss: '#endDate'
				},
				{
					id: 'SearchForm.SearchButton',
					componentType: 'natunamespace.WebButton',
					name: 'Search',
					rootScss: '.SearchForm__submit>button'
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