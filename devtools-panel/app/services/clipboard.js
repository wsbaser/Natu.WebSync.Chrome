import Service from '@ember/service';

export default Service.extend({
	copy(text){
	    var $temp = $("<textarea>");
	    $("body").append($temp);
	    $temp.val(text).select();
	    document.execCommand("copy");
	    $temp.remove();
	}
});
