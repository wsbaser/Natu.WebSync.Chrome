import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('service', {path:'/:service_id'}, function(){
    this.route('page', {path:'/:pageType_id'}, function(){
        this.route('content', {path:'/content'});
    });
  });
  this.route('pageNotFound', { path: '/*wildcard' });
  //this.route('convert');
});

export default Router;
