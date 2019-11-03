import Service from '@ember/service';

export default Service.extend({
	locateInspectedElement(selectorParts, onLocated){
		selectorParts = selectorParts.rejectBy('isBlank');
		let cssArray = selectorParts.map(p=>p.fullCss).filter(s=>!!s);
		let xpathArray = selectorParts.map(p=>p.fullXpath).filter(s=>!!s);
		let cssArrayString = cssArray.length? '["'+cssArray.join('","')+'"]':"[]";
		let xpathArrayString = xpathArray.length? '["'+xpathArray.join('","')+'"]':'[]';
		return this._callEval('locateInspectedElement('+cssArrayString+','+xpathArrayString+')', onLocated);
	},
	_callEval(script, onLocated){
		chrome.devtools.inspectedWindow.eval(script, {useContentScriptContext: true }, onLocated);
	}
});