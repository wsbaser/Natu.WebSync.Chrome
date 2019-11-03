import Service from '@ember/service';

export default Service.extend({
	locateInspectedElement(selectorParts, onLocated){
		let cssArray = selectorParts.map(p=>p.fullCss);
		let xpathArray = selectorParts.map(p=>p.fullXpath);
		let cssArrayString = cssArray.length? '["'+cssArray.join('","')+'"]':"[]";
		let xpathArrayString = xpathArray.length? '["'+xpathArray.join('","')+'"]':'[]';
		return this._callEval('locateInspectedElement('+cssArrayString+','+xpathArrayString+')', onLocated);
	},
	_callEval(script, onLocated){
		chrome.devtools.inspectedWindow.eval(script, {useContentScriptContext: true }, onLocated);
	}
});