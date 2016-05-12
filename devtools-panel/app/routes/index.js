import Ember from 'ember';

export default Ember.Route.extend({
	renderTemplate(){
		this.render('navigation', { outlet: 'navigation' });
		this.render('body', { outlet: 'body' });
	},
	beforeModel(){
		// . Push TEST data into the store
		this.store.pushPayload({
			services: [{id:'AirbnbService'}]
		});
		// this.store.push(this.store.normalize('service', {id:'AirbnbService'}));
		// ServerData.Languages.forEach(function(item){
		// 	self.store.push(self.store.normalize('language', item));
		// });

		this.store.pushPayload({
			pages: [
				{
					id:'MainPage',
					absolutePath: '',
					service: 'AirbnbService'
				},
				{
					id:'ThingsToDoPage',
					absolutePath: 'things-to-do/{city}',
					service: 'AirbnbService'
				},
				{
					id:'SearchApartmentPage',
					absolutePath: 's/{place}',
					service: 'AirbnbService'
				}
			]
		});
		this.store.pushPayload({
			elementInstances:[
				{
					id: '1',
					type:'Input',
					rootScss: '.LocationInput',
					name: 'Location',
					page: 'MainPage',
				},
				{
					id: '2',
					type:'Text',
					rootScss: '.guidebook-place-card__title',
					name: 'Place Title',
					page: 'ThingsToDoPage',
				},
				{
					id: '3',
					type:'Input',
					rootScss: '#map-search-checkin',
					name: 'Check In',
					page: 'SearchApartmentPage',
				}
			]
		});
	}
});