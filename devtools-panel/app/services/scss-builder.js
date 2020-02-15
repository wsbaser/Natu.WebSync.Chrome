import Service from '@ember/service';

export default Service.extend({
	buildScssPart(part){
		let scss = part.combinator||' ';
		if(part.tagName){
			scss+=part.tagName;
		}
		if(part.id){
			scss+='#'+part.id;
		}
		for (let [name, value] of Object.entries(part.attributes)) {
			if(value){
				scss+="["+name+"='"+value+"']";
			}
		}
		part.classNames.forEach(className=>{
			scss+='.'+className;
		});
		part.texts.forEach(text=>{
			scss+="['"+text+"']";
		})
		return scss;
	}
});