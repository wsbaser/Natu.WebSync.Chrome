import Ember from 'ember';
import { A } from '@ember/array';
import { once } from '@ember/runloop';

export default Ember.Controller.extend({
	selectorPartFactory: Ember.inject.service(),
	scssParser: Ember.inject.service(),
	scssBuilder: Ember.inject.service(),
	elementLocator: Ember.inject.service(),
	selectorHighlighter: Ember.inject.service(),
	inputValue: '',
	parts: A([]),
	init(){
		this._super(...arguments);
		console.log("Init ConvertController...");
		Ember.run.schedule("afterRender", this, function() {
      		this.focusInput();
      		this.locateInspectedElement();
      		resizeHandlerFrame.onresize = this.adjustLayout.bind(this);
      		this.bindSourceInputEvents();
    	});

    	chrome.devtools.panels.elements.onSelectionChanged.addListener(this.locateInspectedElement.bind(this));
	},
	bindSourceInputEvents(){
		let element = this.getInputElement();
		element.addEventListener('keyup', this.onCaretPositionChange.bind(this));
		element.addEventListener('click', this.onCaretPositionChange.bind(this));
	},
	onCaretPositionChange(){		
		let previousPosition = this.get('caretPosition');
		let position = this.getInputElement().selectionEnd;
		if(previousPosition!=position){
			let partUnderCaret = this.getPartForCaretPosition(position);
			if(partUnderCaret){
				let xpathElements = partUnderCaret.get('xpathElements');
				let cssElements = partUnderCaret.get('cssElements');
				let elements = cssElements && cssElements.length? cssElements:xpathElements;
				this.selectPart(partUnderCaret, elements);
				this.set('caretPosition', position);
				console.log('caret position changed: '+position);
			}
		}
	},
	getPartForCaretPosition(position){
		let parts = this.get('parts');
		for (var i = 0; i<parts.length; i ++) {
			if(position<=parts[i].get('endIndex')){
				return parts[i];
			}
		};
		return null;
	},
	adjustLayout(){
		$(elementsList).css('top', resizeHandlerFrame.innerHeight+'px');
	},
	locateInspectedElement(){
		this.removeBlankParts();
		this.get('elementLocator').locateInspectedElement(this.get('parts'), (result, exception)=>{
			if(result.partIndex!=-1){
				this.selectLocatedPart(result.partIndex, result.partElements, result.isXpathElements);
			}else{
				this.createBlankPart(result.blankPartIndex, result.blankPartElements);
			}
		});
	},
	isEditable: Ember.computed('selectedPart', function(){
		let selectedPart = this.get('selectedPart');
		let scss = this.get('scss');
		return selectedPart && selectedPart.get('isEditable') && (!scss || scss.isCssStyle);
	}),
	status: Ember.computed(
		'parts.lastObject.xpathElements.[]',
		'parts.lastObject.cssElements.[]', function(){
		let xpathStatus = this.get('parts.lastObject.xpathElements.length')||0;
		let cssStatus = this.get('parts.lastObject.cssElements.length')||0;
		return Math.max(xpathStatus, cssStatus);
	}),
	isExist: Ember.computed('status', function(){
		return this.get('status')>0;
	}),
	isSeveral: Ember.computed('status', function(){
		return this.get('status')>1;
	}),
	removeBlankParts(){
		this.get('parts').removeObjects(this.get('parts').filterBy('isBlank'));
	},
	selectLocatedPart(partIndex, partElements, isXpathElements){
		let part = this.get('parts').objectAt(partIndex);
		let elements = this.get('selectorPartFactory').generateElements(part, partElements, isXpathElements);
		this.selectPart(part, elements);
	},
	createBlankPart(blankPartIndex, blankPartElements){
		let scss = this.get('scss');
		let blankPart = this.get('selectorPartFactory').generateBlankPart(!scss || scss.isCssStyle);
		let elements = this.get('selectorPartFactory').generateElements(blankPart, blankPartElements);
		this.get('parts').insertAt(blankPartIndex, blankPart);
		this.selectPart(blankPart, elements);
	},
	focusInput(){
		this.getInputElement().focus();
	},
	selectInput(){
		this.getInputElement().select();
	},
	selectPartInInput(part){
		// .calculate highlighter position
		let prevPartScss = '';
		let parts = this.get('parts');
		for (var i = 0; i<parts.length; i++) {
			if(parts[i]==part){
				break;
			}
			prevPartScss+= parts[i].get('scss');
		}
		let partScss = part.get('scss');

		let inputElement = this.getInputElement()
		let inputStyle = window.getComputedStyle(inputElement);
		let inputFont =  inputStyle.fontSize +' '+ inputStyle.fontFamily;

		let left = this.getTextWidth(prevPartScss, inputFont);
		let width = this.getTextWidth(partScss, inputFont); 

		let $partHighlighter = $('#partHighlighter');
		$partHighlighter.css('left', left+'px');
		$partHighlighter.css('width', width+'px');


		// .set caret position
		if(window.document.activeElement!==inputElement && !part.get('isBlank')){
			let caretPosition = part.get('endIndex');
			inputElement.setSelectionRange(caretPosition, caretPosition);
			this.set('caretPosition', caretPosition);
			console.log('caret position changed 2: '+caretPosition);
			inputElement.focus();
		}
	},
	getTextWidth(text, font) {
	    // if given, use cached canvas for better performance
	    // else, create new canvas
	    var canvas = this.getTextWidth.canvas || (this.getTextWidth.canvas = document.createElement("canvas"));
	    var context = canvas.getContext("2d");
	    context.font = font;
	    var metrics = context.measureText(text);
	    return metrics.width;
	},
	getInputElement(){
		return document.getElementById('source');
	},
	onSourceSelectorChanged: Ember.observer('inputValue', function(){
		var selector = this.get('inputValue').trim();
		var scssParser = this.get('scssParser');

		let scss;
		try {
			scss = scssParser.parse(selector);            
		} catch (e) {
			console.log('Unable to convert scss selector "' + selector + '"');
		}
		scss = scss || {
				parts: [],
				css: null,
				xpath: null,
				isCssStyle: true
			};
		this.set('scss', scss);

		this.updateParts(this.get('selectorPartFactory').generateParts(scss.parts));

		if(!selector){
			this.focusInput();
		}
	}),
	updateParts(newParts){
		let oldParts = this.get('parts');

		let partsMatch = true;
		for(let i=0; i<newParts.length || i<oldParts.length;i++){
			let newPart = newParts.objectAt(i);
			let oldPart = oldParts.objectAt(i);
			let curPartsMatch = newPart && oldPart && newPart.selectorsEqualTo(oldPart);
			partsMatch &= curPartsMatch;
			if(partsMatch){
				// .no changes encountered, continue
				continue;
			}
			if(curPartsMatch){
				// .current parts match, but some prevous are different - update 
				newPart.set('isSelected', oldPart.get('isSelected'));
 				oldParts.replace(i, 1, [newPart]);
			}else{
				if(!newPart){
					// .remove old part
					oldParts.removeAt(i--);
				}else if(!oldPart){
					// .add new part
					oldParts.pushObject(newPart);
				}else{
					let nextNewPart = newParts.objectAt(i+1);
					let nextOldPart = oldParts.objectAt(i+1);
					if(!nextNewPart && !nextOldPart ||
						(nextNewPart && nextOldPart && nextNewPart.selectorsEqualTo(nextOldPart))){
						newPart.set('isSelected', oldPart.get('isSelected'));
 						oldParts.replace(i, 1, [newPart]);
					}else if(nextOldPart && newPart.selectorsEqualTo(nextOldPart)){
						// .part was removed
						oldParts.removeAt(i--);
					}else if(nextNewPart && nextNewPart.selectorsEqualTo(oldPart)){
						// .part was added
						oldParts.insertAt(i, newPart);
					}else{
						oldParts.replace(i, 1, [newPart]);
					}
				}
			}
		}

		// .if selected part was changed - clear elements list
		if(!oldParts.some(p=>p.get('isSelected'))){
			// this.set('elements', A());
			this.locateInspectedElement();
			// if(oldParts.length){
			// 	oldParts.objectAt(0).set('isSelected',true);
			// }
		}
	},
	getSelectorRootElement(isXpath){
		// TODO: get rid of this shit
		return isXpath?$('#targetXPath'):$('#targetCss');
	},
	copyToClipboard(text) {
	    var $temp = $("<input>");
	    $("body").append($temp);
	    $temp.val(text).select();
	    document.execCommand("copy");
	    $temp.remove();
	},
	selectPart(part, elements){
		this.set('selectedPart', part);
		this.set('elements', elements);

		// .update selected part state
		this.get('parts').forEach(function(p){
			p.set('isSelected', p == part);
		});

		if(!elements){
			debugger;
		}

		// .select first if no element is selected
		if(elements.length && elements.every(e=>!e.get('isSelected'))){
			elements.objectAt(0).set('isSelected', true);
		}

		this.selectPartInInput(part);
	},
	actions:{
		copySelectorStart(isXpath){
			this.getSelectorRootElement(isXpath).addClass('selected');
			let noBlank = this.get('parts').rejectBy('isBlank');
			let lastPart = noBlank.length?noBlank[noBlank.length-1]:null;
			if(lastPart){
				let selector = isXpath?lastPart.get('fullXpath'):lastPart.get('fullCss');
				this.copyToClipboard(selector);
			}
		},
		copySelectorEnd(isXpath){
			this.getSelectorRootElement(isXpath).removeClass('selected');
		},
		onRemovePart(part){
			// if(part.get('isSelected')){
			// 	this.set('elements', A([]));
			// }
			let toRemoveIndex = this.get('parts').indexOf(part);
			let scssList = this.get('parts').map(p=>p.scss);
			scssList.splice(toRemoveIndex, 1);
			let modifiedScss =  scssList.join('');
			this.set('inputValue', modifiedScss);
		},
		onRemoveSelector(){
			this.set('inputValue', '');
		},
		onCopySelector(){
			this.copyToClipboard(this.get('inputValue'));
			this.selectInput();
		},
		onPartAttributeToggle(part){
			// .rebuild selector
			let parts = this.get('parts');
			let scssBuilder = this.get('scssBuilder');
			
			let scssParts = parts.map(p=>{
				return p==part?
					scssBuilder.buildScssPart({
						combinator: part.combinator,
						id: part.id,
						tagName: part.tagName,
						classNames: part.classNames,
						texts: part.texts
					}):
					p.get('scss');
			});

			// .remove leading space for the first selector
			scssParts[0] = scssParts[0].trim();

			// .and set new selector to input
			this.set('inputValue', scssParts.join(''));
		},
		onPartSelected(part, elements){
			this.removeBlankParts();
			this.selectPart(part, elements);
		},
		onPartElementSelected(element){
			this.get('elements').forEach(function(e){
	          if(e != element){
	        	e.set('isSelected', false);
	          }
	        });
		},
		onCopyButtonEnter(){
			let lastPart = this.get('parts.lastObject');
			if(lastPart && !lastPart.get('isBlank')){
				this.get('selectorHighlighter').highlight({
					css: lastPart.get('fullCss'),
					xpath: lastPart.get('fullXpath')
				});
			}
		},
		onCopyButtonLeave(){
			this.get('selectorHighlighter').removeHighlighting();
		}
	}
});