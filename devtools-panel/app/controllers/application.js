import Ember from 'ember';
import { A } from '@ember/array';
import { once } from '@ember/runloop';
import ComponentSelector from '../models/component-selector';
import Notification from '../models/notification';

export default Ember.Controller.extend({
	selectorPartFactory: Ember.inject.service(),
	scssParser: Ember.inject.service(),
	scssBuilder: Ember.inject.service(),
	elementLocator: Ember.inject.service(),
	selectorHighlighter: Ember.inject.service(),
	clipboard: Ember.inject.service(),
	pluralizer: Ember.inject.service(),
	inputValue: '',
	rootParts: A([]),
	parts: A([]),
	selectors: A([]),
	elements: A([]),
	elementsSlice: Ember.computed('elements', function(){
		return this.get('elements');	//.slice(0, 50);
	}),
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
				this.selectPart(partUnderCaret, elements || A());
				this.set('caretPosition', position);
				//console.log('caret position changed: '+position);
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
		$(bottomPanel).css('top', selectorsConverter.offsetHeight+'px');
	},
	collapseSelectorsList(){
		this.set('selectorsListIsExpanded', false);
		this.get('selectorHighlighter').removeHighlighting();
	},
	expandSelectorsList(){
		this.set('selectorsListIsExpanded', true);	
	},
	locateInspectedElement(){
		console.log('Inspected element changed.');
		this.collapseSelectorsList();
		this.get('elementLocator').locateInspectedElement(this.get('parts'), (result, exception)=>{
			this.removeBlankParts();
			if(exception){
				console.log('Unable to locate inspected element.', exception);
				return;
			}
			if(!result){
				return;
			}
			if(result.partIndex!=-1){
				console.log('elementLocated - select existing part');
				this.selectLocatedPart(result.partIndex, result.partElements, result.isXpathElements);
			}else{
				console.log('elementLocated - create blank part', result.blankPartElements);
				this.createBlankPart(result.blankPartIndex, result.blankPartElements);
			}
		});
	},
	isEditable: Ember.computed('selectedPart', function(){
		let selectedPart = this.get('selectedPart');
		let scss = this.get('scss');
		return selectedPart && selectedPart.get('isEditable') && (!scss || scss.isCssStyle);
	}),
	isEditMode: Ember.computed('selectorToUpdate', function(){
		if(this.get('selectorToUpdate')){
			this.setInputValue(this.get('selectorToUpdate.selector.scss'));			
			this.selectPartInInput(this.get('parts.lastObject'));
			return true;
		}
		return false;
	}),
	rootScss: Ember.computed('rootParts.[]', function(){
		return this.get('rootParts.lastObject.fullScss');
	}),
	lastPart: Ember.computed('parts.[]', function(){
		return this.get('parts').rejectBy('isBlank').get('lastObject');
	}),
	status: Ember.computed(
		'lastPart.xpathElements.[]',
		'lastPart.cssElements.[]', function(){
		let lastPart = this.get('lastPart');
		let xpathStatus = lastPart.get('xpathElements.length')||0;
		let cssStatus = lastPart.get('cssElements.length')||0;
		return Math.max(xpathStatus, cssStatus);
	}),
	// isExist: Ember.computed('status', function(){
	// 	return this.get('status')>0;
	// }),
	// isSeveral: Ember.computed('status', function(){
	// 	return this.get('status')>1;
	// }),
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

		this.setHighlighter(left, width);

		// .set caret position
		if(!part.get('isBlank') && (this.get('updateCaretPosition') || window.document.activeElement!==inputElement)){
			let caretPosition = part.get('endIndex');
			inputElement.setSelectionRange(caretPosition, caretPosition);
			this.set('caretPosition', caretPosition);
			//console.log('caret position changed 2: '+caretPosition);
			inputElement.focus();
			this.set('updateCaretPosition', false);
		}
	},
	setHighlighter(left, width){
		let $partHighlighter = $('#partHighlighter');
		$partHighlighter.css('left', left+'px');
		$partHighlighter.css('width', width+'px');
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


		let newParts = this.get('selectorPartFactory').generateParts(scss.parts);

		if(this.get('rootParts.length') && newParts.length){
			var space = newParts.get('firstObject.isCssStyle') && newParts.get('firstObject.combinator') ?'':' ';
			let rootPart = this.get('rootParts.lastObject');
			let rootScss = rootPart.get('fullScss');
			let rootCss = rootPart.get('fullCss');
			let rootXpath = rootPart.get('fullXpath');
			newParts.forEach(function(p){
				p.set('fullScss', rootScss+space+p.get('fullScss'));
				if(rootCss && p.get('fullCss')){
					p.set('fullCss', rootCss+space+p.get('fullCss'));
				}
				if(rootXpath && p.get('fullXpath')){
					p.set('fullXpath', rootXpath + p.get('fullXpath'));
				}
			});
		}

		this.updateParts(newParts);

		if(!selector){
			this.focusInput();
		}
	}),
	updateParts(newParts){
		let oldParts = this.get('parts');

		//let partsMatch = true;
		for(let i=0; i<newParts.length || i<oldParts.length;i++){
			let newPart = newParts.objectAt(i);
			let oldPart = oldParts.objectAt(i);
			let curPartsMatch = newPart && oldPart && newPart.selectorsEqualTo(oldPart);
			//partsMatch &= curPartsMatch;
			// if(partsMatch){
			// 	// .no changes encountered, continue
			// 	continue;
			// }
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
		this.get('clipboard').copy(text);
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
		// if(elements.length && elements.every(e=>!e.get('isSelected'))){
		// 	elements.objectAt(0).set('isSelected', true);
		// }

		this.selectPartInInput(part);
	},
	setInputValue(value){
		this.set('inputValue', value);
		this.set('updateCaretPosition', true);
		// .old highlighter is not valid anymore
		this.setHighlighter(0,0);
	},
	selectElement(elements, element){
		elements.forEach(e=>{
			e.set('isSelected', e === element);
			if(e.get('children.length')){
				this.selectElement(e.get('children'), element);
			}
		});
	},
	generateComponentName(){
		return "Component Name";
	},
	getSelector(){
		return this.get('lastPart').getSelector();
	},
	addToList(){
		if(this.get('inputValue')){
			let componentSelector = ComponentSelector.create({
				name: this.generateComponentName(),
				selector: this.getSelector(),
				elementsCount: this.get('status'),
				stateText: this.get('pluralizer').pluralize(this.get('status'), "element"),
				isSelected: !this.get('selectors.length')
			});
			this.get('selectors').pushObject(componentSelector);
			this.setInputValue('');
			this.showNotification("Selector was added to the list.");
		}
	},
	updateSelector(){
		if(this.get('inputValue')){
			let componentSelector = this.get('selectorToUpdate');
			componentSelector.set('selector', this.getSelector());
			componentSelector.set('wasUpdated', true);
			window.setTimeout(function(){
				componentSelector.set('wasUpdated', false);
			}, 2000);						
			componentSelector.set('elementsCount', this.get('status'));
			componentSelector.set('stateText', this.get('pluralizer').pluralize(this.get('status'), "element"));
			this.set('selectorToUpdate', null);
			this.setInputValue('');
			this.expandSelectorsList();
		}
	},
	cancelSelectorUpdate(){
		this.set('selectorToUpdate', null);
		this.setInputValue('');
		this.expandSelectorsList();
	},
	removePart(part){
		let toRemoveIndex = this.get('parts').indexOf(part);
		let scssList = this.get('parts').map(p=>p.scss);
		scssList.splice(toRemoveIndex, 1);
		let modifiedScss = scssList.join('');
		if(toRemoveIndex==0){
			// if next part starts with space - trim it
			modifiedScss = modifiedScss.trimStart();
		}
		this.setInputValue(modifiedScss);
	},
	makeRoot(part){
		if(this.get('rootParts.length')){
			this.get('selectorHighlighter').removeRootHighlighting(this.get('rootParts.lastObject').getSelector());
		}
		let newRootParts=A([]);
		let current;
		do{
			current = this.get('parts').shiftObject();
			newRootParts.pushObject(current);
		} while(current != part);
		this.get('rootParts').pushObjects(newRootParts);

		let scssWithoutRoot = this.get('parts').map(p=>p.scss).join('').trimStart();
		this.setInputValue(scssWithoutRoot);
		this.get('selectorHighlighter').highlightRootSelector(this.get('rootParts.lastObject').getSelector());
	},
	removeRoot(){
		if(this.get('rootParts.length')){
			this.get('selectorHighlighter').removeRootHighlighting(this.get('rootParts.lastObject').getSelector());
			this.get('parts').unshiftObjects(this.get('rootParts'));
			this.get('rootParts').clear();
			this.setInputValue(this.get('lastPart.fullScss'));
		}
	},
	showNotification(message){
		if(this.get("notification")){
			// .what should we do in this case?
		}else{
			this.set('notification', Notification.create({
				message: message
			}));
			setTimeout(function(){
				this.set('notification', null);
			}.bind(this), 2500);
		}
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
			this.removePart(part);
		},
		onRemoveSelector(){
			this.setInputValue('');
		},
		onCopySelector(){
			if(this.get('inputValue')){
				this.copyToClipboard(this.get('inputValue'));
				this.selectInput();
			}
		},
		onPartAttributeToggle(part){
			// .rebuild selector
			let parts = this.get('parts');
			let scssBuilder = this.get('scssBuilder');
			
			let partScss = scssBuilder.buildScssPart(part);

			let scssParts = parts.map(p=>p==part?partScss:p.get('scss'));

			// .if first part attribute was toggled
			if(part==parts.objectAt(0)){
				// .remove leading space for the first part selector
				scssParts[0] = scssParts[0].trim();

				let secondPart = parts.objectAt(1);
				if(secondPart){
					if(scssParts[0]){
						// .part added or updated
						if(secondPart.get('combinator').length==0){
							// . no combinator - add space
							scssParts[1] = ' ' + scssParts[1];
						}
					}else{
						// . part removed - trim leading space
						scssParts[1] = scssParts[1].trimStart();
					}
				}
			}	

			// .and set new selector to input
			this.setInputValue(scssParts.join(''));
		},
		onPartSelected(part, elements){
			this.removeBlankParts();
			this.selectPart(part, elements);
		},
		onPartElementSelected(element){
			this.selectElement(this.get('elements'), element);
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
		},
		onAddToList(){
			this.addToList();
		},
		onEdtiComponentSelector(componentSelector){
			this.removeRoot();
			this.set('selectorToUpdate', componentSelector);
			this.collapseSelectorsList();
		},
		onSelectorConverterFocus(){
			this.collapseSelectorsList();
		},
		onInputKeyDown(){
			switch(event.code){
				case "Enter":
					if(this.get('isEditMode')){
						this.updateSelector();
					}else{
						this.addToList();
					}
				break;
				case "Escape":
					if(this.get('isEditMode')){
						this.cancelSelectorUpdate();
					}
				break;
			}
		},
		onCancelSelectorUpdate(){
			this.cancelSelectorUpdate();
		},
		onUpdateSelector(){
			this.updateSelector();
		},
		onRemoveRoot(){
			this.removeRoot();
		},
		onRootMouseEnter(){
			this.get('selectorHighlighter').highlight(this.get('rootParts.lastObject').getSelector());
		},
		onRootMouseLeave(){
			this.get('selectorHighlighter').removeHighlighting();
		}
	}
});