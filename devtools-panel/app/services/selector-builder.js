import Ember from 'ember';

export default Ember.Service.extend({
	innerSelector(rootSelector, relativeSelector){
		if(!relativeSelector || !relativeSelector.scss){
			return null;
		}
		if(!relativeSelector.combineWithRoot){
			return relativeSelector;
		}
		rootSelector = rootSelector || {};
		var css = this.innerScss(rootSelector.css, relativeSelector.css);
		var xpath = this.innerXpath(rootSelector.xpath, relativeSelector.xpath);
		return {
			scss: css || xpath,
			css: css,
			xpath: xpath
		};
	},
	innerScss(rootScss, relativeScss){
		if(rootScss && relativeScss){
			return rootScss + ' ' + relativeScss;
		}
		else if(rootScss){
			return rootScss;
		}
		else if(relativeScss){
			return relativeScss;
		}
		return null;
	},
	innerXpath(root, relative){
		if(root && relative){
			if(relative.startsWith('//')){
				return root + relative;
			}else if(this.hasAxis(relative)){
				return root + '/' + relative;
			}
			else{
				return root + '//' + relative;
			}
		}
		else if(root){
			return root;
		}
		else if(relative){
			return relative.startsWith('//')?relative:"//${relativeScss}";
		}
		return null;
	},
	hasAxis(xpath){
		xpath = xpath.trim();
		var axises = [
			"descendant::",
			"ancestor::",
			"ancestor-or-self::",
			"attribute::",
			"child::",
			"descendant-or-self::",
			"following::",
			"following-sibling::",
			"namespace::",
		 	"parent::",
		 	"preceding::",
		 	"preceding-sibling::",
		 	"self::"];
		return axises.some(axis=> xpath.startsWith(axis));
	}
});
