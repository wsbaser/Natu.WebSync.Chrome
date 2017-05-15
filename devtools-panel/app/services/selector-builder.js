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
		let invalidRootCss = !rootSelector.css && rootSelector.xpath;
		let invalidRootXpath = rootSelector.css && !rootSelector.xpath;
		var css = invalidRootCss ? null : this.innerCss(rootSelector.css, relativeSelector.css);
		var xpath = invalidRootXpath ? null : this.innerXpath(rootSelector.xpath, relativeSelector.xpath);
		xpath = this.normalizeXpath(xpath);
		return {
			scss: css || xpath,
			css: css,
			xpath: xpath
		};
	},
	normalizeXpath(xpath){
		return xpath.startsWith('//') ? xpath: '//' + xpath;
	},
	innerCss(rootScss, relativeScss){
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
			return relative;
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
