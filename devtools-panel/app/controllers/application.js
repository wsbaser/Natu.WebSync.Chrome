import Ember from 'ember';
import { A } from '@ember/array';
import { once } from '@ember/runloop';

export default Ember.Controller.extend({
	selectorPartFactory: Ember.inject.service(),
	scssParser: Ember.inject.service(),
	scssBuilder: Ember.inject.service(),
	elementLocator: Ember.inject.service(),
	inputValue: '',
	parts: A([]),
	init(){
		console.log ("Init ConvertController...");
		Ember.run.schedule("afterRender", this, function() {
      		this.focusInput();
    	});

    	chrome.devtools.panels.elements.onSelectionChanged.addListener(this.onElementsSelectionChanged.bind(this));
	},
	onElementsSelectionChanged(){
		this.removeBlankParts();
		this.get('elementLocator').locateInspectedElement(this.get('parts'), (result, exception)=>{
			if(result.partIndex!=-1){
				this.selectPartAndElement(result.partIndex, result.elementIndex, result.partElements);
			}else{
				this.createBlankPart(result.blankPartIndex, result.blankPartElements);
			}
		});
	},
	removeBlankParts(){
		this.get('parts').removeObjects(this.get('parts').filterBy('isBlank'));
	},
	selectPartAndElement(partIndex, elementIndex, partElements){
		let part = this.get('parts').objectAt(partIndex);
		let elements = this.get('selectorPartFactory').generateElements(part, partElements);
		this.selectPart(part, elements, elementIndex);
	},
	createBlankPart(blankPartIndex, blankPartElements){
		let blankPart = this.get('selectorPartFactory').generateBlankPart();
		let elements = this.get('selectorPartFactory').generateElements(blankPart, blankPartElements);
		this.get('parts').insertAt(blankPartIndex, blankPart);
		this.selectPart(blankPart, elements);
	},
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
	focusInput(){
		document.getElementById('source').focus();
	},
	selectInput(){
		document.getElementById('source').select();
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
				xpath: null
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
			this.set('elements', A());
		}
	},
	updateSinglePart(oldParts, newParts){
		if(Math.abs(newParts.length-oldParts.length)>1){
			return false;
		}

		// .possible single part chage
		// .find new/removed/updated part
		for(let i=0; i<Math.max(newParts.length, oldParts.length); i++){
			let newPart = newParts.objectAt(i);
			let oldPart = oldParts.objectAt(i);

			if(newPart && oldPart && newPart.selectorsEqualTo(oldPart)){
				// .no changes encountered, continue
				continue;
			}

			// .compare tails
			let newTail = newParts.slice(i).reverse();
			let oldTail = oldParts.slice(i).reverse();
			let tailLength = newTail.length==oldTail.length?
				newTail.length-1:
				Math.min(newTail.length, oldTail.length);
			for (var j = 0; j<tailLength; j++) {
				if(!newTail[j].selectorsEqualTo(oldTail)){
					// .more then one part changed
					return false;
				}
			};

			// .update parts list
			if(newTail.length>oldTail.length){
				// .this is an added part, insert it to the parts list
				oldParts.insertAt(i, newPart);
			}else if(oldTail.length>newTail.length){
				// .a part was removed, remove it from the parts list
				oldParts.removeAt(i);
			}else{
 				// .this is a changed part, update it
 				newPart.set('isSelected', oldPart.get('isSelected'));
 				oldParts.replace(i, 1, [newPart]);
 				//oldPart.copyFrom(newPart);
			}
			return true;
		}

		return true;
	},
	getSelectorRootElement(selectorType){
		switch(selectorType){
			// case 0:
				// return $('#targetScss');
			case 1:
				return $('#targetCss');
			case 2:
				return $('#targetXPath');
			default:
				throw new Error("Invalid selector type.");
		}
	},
	copyToClipboard(text) {
	    var $temp = $("<input>");
	    $("body").append($temp);
	    $temp.val(text).select();
	    document.execCommand("copy");
	    $temp.remove();
	},
	selectPart(part,elements,elementIndex){
		elementIndex = elementIndex||0;
		// this.set('selectedPart', part);
		this.set('elements', elements);

		// .update selected part state
		this.get('parts').forEach(function(p){
			p.set('isSelected', p == part);
		});

		// .update selected element state
		for (var i = elements.length - 1; i >= 0; i--) {
			elements[i].set('isSelected', i==elementIndex);
		};
	},
	actions:{
		copySelectorStart(selectorType, value){
			this.getSelectorRootElement(selectorType).addClass('selected');
			this.copyToClipboard(value);
		},
		copySelectorEnd(selectorType){
			this.getSelectorRootElement(selectorType).removeClass('selected');
		},
		onRemovePart(part){
			if(part.get('isSelected')){
				this.set('elements', A([]));
			}
			this.get('parts').removeObject(part);
			let modifiedScss =  this.get('parts').map(p=>p.scss).join('');
			this.set('inputValue', modifiedScss);
		},
		onRemoveSelector(){
			this.set('inputValue', '');
		},
		onCopySelector(){
			this.copyToClipboard(this.get('inputValue'));
			this.selectInput();
		},
		onPartAttributeToggle(){
			let parts = this.get('parts');
			let scssBuilder = this.get('scssBuilder');
			let scss = parts.map(part=>
				scssBuilder.buildScssPart({
					id: part.id,
					tagName: part.tagName,
					classNames: part.classNames,
					texts: part.texts
				})).join(' ');
			this.set('inputValue', scss);
		},
		onPartSelected(part, elements){
			this.selectPart(part, elements);
		},
		onPartElementSelected(element){
			this.get('elements').forEach(function(e){
	          if(e != element){
	        	e.set('isSelected', false);
	          }
	        });
		}
	}
});