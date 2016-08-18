import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
    this.route('service',{path:'/:service_id'}, function(){
      this.route('page', {path:'/:page_id'}, function(){
          this.route('content', {path:'/content'});
      });
  	});
  	//this.route('pageNotFound', { path: '/*wildcard' });
});

export default Router;
