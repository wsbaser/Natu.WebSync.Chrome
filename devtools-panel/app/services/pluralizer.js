import Service from '@ember/service';

export default Service.extend({
	pluralize(count, text){
		if(count%10==1 && count%100!=11){
			return count + " " + text;
		}
		return count + " " + text + "s";
	}
});
