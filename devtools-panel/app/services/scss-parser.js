import Service from '@ember/service';

export default Service.extend({
    parse(scssSelector) {
        if (!scssSelector) {
            return null;
        }

        let combineWithRoot = false;
        let ROOT_PREFIX = 'root:';
        if (scssSelector.startsWith(ROOT_PREFIX)) {
            combineWithRoot = true;
            scssSelector = scssSelector.replace(ROOT_PREFIX, '').trim();
        }

        let parts;
        let isCssStyle = true;
        try {
            parts = this.parseScss(scssSelector);
        } catch (e) {
            isCssStyle = false;
            // .consider selector is xpath
            parts = this.parseXpath(scssSelector);
            let hasInvalidParts = false;
            for (var i = 0; i<parts.length;  i++) {
                let partXpathIsValid = this.xpathIsValid(parts[i].fullXpath);
                hasInvalidParts &= partXpathIsValid;
                if(hasInvalidParts){
                    parts[i].xpath='';
                    parts[i].fullXpath='';
                }
            };
        }

        let isValidCss = parts.every(p=>p.css);
        let css = isValidCss?parts.map(p=>p.css).join(''):null;
        let xpath = parts.map(p=>p.xpath).join('');

        return {
            combineWithRoot: combineWithRoot,
            scss: scssSelector,
            css: css,
            xpath: xpath,
            parts: parts,
            isCssStyle: isCssStyle
        };
    },
    parseXpath(xpathSelector){
        let hasRoot;
        if(xpathSelector.startsWith("//")){
            xpathSelector = this.cutLeadingString(xpathSelector,"//");
            hasRoot=true;
        }
        let xpathParts = this.splitScssToParts(xpathSelector, '/','//');
        let parts=[];
        let fullXpath='';
        let startIndex=0;
        for (var i = 0; i < xpathParts.length; i++) {
            let xpath = i==0 && hasRoot? "//"+xpathParts[i]: xpathParts[i];
            fullXpath+=xpath;
            parts.push({
                isXpath: true,
                index: i,
                scss: xpath,
                xpath: xpath,
                fullXpath: fullXpath,
                isCssStyle: false,
                startIndex: startIndex
            });
            startIndex += xpath.length;
        }
        return parts;
    },
    xpathIsValid(selector){
        try{
            document.evaluate(selector, document, null, XPathResult.ANY_TYPE, null);
            return true;
        }catch(e){
            return false;
        }
    },
    // private
    IsNullOrWhiteSpace(input) {
        if (typeof input === 'undefined' || input == null) return true;
        return input.replace(/\s/g, '').length < 1;
    },
    // private
    splitScssToParts(scssSelector, ...delimiters) {
        let parts = [];
        let value = '';
        let readCondition = false;
        let readFunctionArgument = false;
        let conditionOpenBrackets =  { Count: 0 };
        scssSelector = scssSelector || '';

        delimiters.sort((a,b)=>{return a.length<b.length?1:a.length>b.length?-1:0});

        while(scssSelector.length){
            let c = scssSelector[0];
            if (readCondition) {
                if (this.IsClosingConditionBracket(conditionOpenBrackets, c)) {
                    readCondition = false;
                }
            }
            else if (readFunctionArgument) {
                if (c == ')') {
                    readFunctionArgument = false;
                }
            }
            else{
                let delimiter = delimiters.find(d=>scssSelector.startsWith(d));
                if(delimiter){
                    if (!this.IsNullOrWhiteSpace(value)) {
                        parts.push(value);
                    }
                    value='';
                    c = delimiter;
                }else if (c == '[') {
                    readCondition = true;
                }
                else if (c == '(') {
                    readFunctionArgument = true;
                }
            }
            value += c;
            scssSelector = scssSelector.slice(c.length);
        }
        if (!value
            || readCondition
            || readFunctionArgument) {
            throw "splitScssToParts: unexpected end of line";
        }
        parts.push(value);


        // for (let i = 0; i < scssSelector.length; i++) {
        //     let c = scssSelector[i];
        //     if (readCondition) {
        //         if (this.IsClosingConditionBracket(conditionOpenBrackets, c)) {
        //             readCondition = false;
        //         }
        //     }
        //     else if (readFunctionArgument) {
        //         if (c == ')') {
        //             readFunctionArgument = false;
        //         }
        //     }
        //     else if (delimiters.includes(c)) {
        //         if (!this.IsNullOrWhiteSpace(value)) {
        //             parts.push(value);
        //         }
        //         value = '';
        //     }
        //     else if (c == '[') {
        //         readCondition = true;
        //     }
        //     else if (c == '(') {
        //         readFunctionArgument = true;
        //     }
        //     value += c;
        // }
        // if (!value
        //     || readCondition
        //     || readFunctionArgument) {
        //     throw "splitScssToParts: unexpected end of line";
        // }
        // parts.push(value);
        return parts;
    },
    // private
    IsClosingConditionBracket(conditionOpenBrackets, c) {
        if (c == '[')
            conditionOpenBrackets.Count++;
        else if (c == ']') {
            if (conditionOpenBrackets.Count == 0)
                return true;
            conditionOpenBrackets.Count--;
        }
        return false;
    },
    // private
    parseScss(scss, isInner) {
        let scssParts = this.splitScssToParts(scss, ' ', '>', '+');
        let parts=[];
        let fullCss='';
        let fullXpath=''
        let encounteredInvalidCss = false;
        let startIndex=0;
        for (let i = 0; i < scssParts.length; i++){
            let part = this.parseScssPart(scssParts[i]);
            part.index = i;
            if(i==0){
                if(isInner){
                    part.xpath = this.RemoveChildAxis(part.xpath);
                }else{
                    part.xpath = "//" + this.RemoveDescendantAxis(part.xpath);
                }
            }else{
                part.xpath = "/" + this.RemoveChildAxis(part.xpath);
            }

            // .so far we consider part.xpath to be always valid
            fullXpath+=part.xpath;
            part.fullXpath=fullXpath;

            // .when part.css can be invalid because it does not support some functions that xpath does
            // .we concatenate css only until we encounter invalid css selector
            if(part.css && !encounteredInvalidCss){
                if(i==0){
                    part.css = part.css.trim();
                }
                fullCss+=part.css;
                part.fullCss=fullCss;
            }else{
                encounteredInvalidCss=true;
            }

            part.startIndex = startIndex;
            startIndex+=scssParts[i].length;
            parts.push(part);
        }
        
        return parts;
    },
    // private
    cutLeadingString(text, toCut){
        return text.startsWith(toCut)?text.slice(toCut.length):text;
    },
    RemoveDescendantAxis(elementXpath)
    {
        return this.cutLeadingString(elementXpath,"descendant::");
    },
    // private
    RemoveChildAxis(elementXpath)
    {
        return this.cutLeadingString(elementXpath,"child::");
    },
    // private
    parseScssPart(partScss) {
        const State = {
            Undefined: 0,
            ReadId: 10,
            ReadTag: 20,
            ReadClass: 30,
            ReadCondition: 40,
            ReadFunction: 50,
            ReadFunctionArgument: 60,
        };
        if (this.IsNullOrWhiteSpace(partScss)) {
            throw "Invalid scss: " + partScss;
        }
        partScss = partScss.trim();
        let combinator = ' ';
        if (['>','+'].includes(partScss[0])) {
            combinator = partScss[0];
            partScss = partScss.slice(1);
        }
        let tag = '';
        let id = '';
        let className = '';
        let condition = '';
        let func = '';
        let functionArgument = '';
        let classNames = [];
        let attributes = [];
        let conditions = [];
        let texts = [];
        let subelementXpaths = [];
        let state = State.ReadTag;
        let conditionOpenBrackets = { Count: 0 }; // количество открытых скобок [ внутри условия
        for (let i = 0; i < partScss.length; i++) {
            let c = partScss[i];
            if (state == State.ReadCondition
                && !this.IsClosingConditionBracket(conditionOpenBrackets, c)) {
                // внутри условия могут быть символы . # [ на которые нужно не обращать внимания
                condition += c;
                continue;
            }
            switch (c) {
                case '.':
                    switch (state) {
                        case State.ReadClass:
                            if (!className) {
                                throw "incorrect symbol for state: state: "+state+", index: "+i+", scss: "+partScss+"}";
                            }
                            classNames.push(className);
                            className = '';
                            break;
                        case State.ReadId:
                            if (!id){
                                throw "incorrect symbol for state: state: "+state+", index: "+i+", scss: "+partScss+"}";
                            }
                            break;
                        case State.ReadTag:
                        case State.Undefined:
                            break; // допустимые состояния
                        default:
                            throw "incorrect symbol for state: state: "+state+", index: "+i+", scss: "+partScss+"}";
                            break;
                    }
                    state = State.ReadClass;
                    break;
                case '#':
                    if (id){
                        throw "two ids are illegal";
                    }
                    switch (state) {
                        case State.ReadClass:
                            if (!className){
                                throw "incorrect symbol for state: state: "+state+", index: "+i+", scss: "+partScss+"}";
                            }
                            classNames.push(className);
                            className = '';
                            break;
                        case State.ReadTag:
                        case State.Undefined:
                            break;
                        default:
                            throw "incorrect symbol for state: state: "+state+", index: "+i+", scss: "+partScss+"}";
                            break;
                    }
                    state = State.ReadId;
                    break;
                case '[':
                    switch (state) {
                        case State.ReadClass:
                            if (!className){
                                throw "incorrect symbol for state: state: "+state+", index: "+i+", scss: "+partScss+"}";
                            }
                            classNames.push(className);
                            className = '';
                            break;
                        case State.ReadId:
                            if (!id){
                                throw "incorrect symbol for state: state: "+state+", index: "+i+", scss: "+partScss+"}";
                            }
                            break;
                        case State.ReadTag:
                        case State.Undefined:
                            break; // допустимые состояния
                        default:
                            throw "incorrect symbol for state: state: "+state+", index: "+i+", scss: "+partScss+"}";
                            break;
                    }

                    state = State.ReadCondition;
                    break;
                case ']':
                    if (state != State.ReadCondition){
                        throw "incorrect symbol for state: state: "+state+", index: "+i+", scss: "+partScss+"}";
                    }
                    if (this.IsText(condition)){
                        // текстовое условие
                        texts.push(condition[0] == '~' ? condition.slice(2,condition.length-1) : condition.slice(1,condition.length-1));
                        conditions.push(condition);
                    }else if (this.IsNumber(condition)
                        || this.IsFunction(condition)) {
                        conditions.push(condition);
                    } else {
                        let attribute = this.ParseAttribute(condition);
                        if (attribute != null) {
                            attributes.push(attribute);
                        } else {
                            // вложенный селектор
                            try {
                                let innerParts = this.parseScss(condition, true);
                                subelementXpaths.push(innerParts[innerParts.length-1].fullXpath);
                            } catch(e) {
                                conditions.push(condition);
                            }
                        }
                    }
                    condition = '';
                    state = State.Undefined;
                    break;
                case ':':
                    switch (state) {
                        case State.ReadFunction:
                        case State.ReadFunctionArgument:
                            throw "incorrect symbol for state: state: "+state+", index: "+i+", scss: "+partScss+"}";
                            break;
                        default:
                            state = State.ReadFunction;
                            break;
                    }
                    break;
                case '(':
                    if (state != State.ReadFunction){
                        throw "incorrect symbol for state: state: "+state+", index: "+i+", scss: "+partScss+"}";
                    }
                    state = State.ReadFunctionArgument;
                    break;
                case ')':
                    if (state != State.ReadFunctionArgument){
                        throw "incorrect symbol for state: state: "+state+", index: "+i+", scss: "+partScss+"}";
                    }
                    state = State.Undefined;
                    break;
                default:
                    switch (state) {
                        case State.ReadId:
                            id += c;
                            break;
                        case State.ReadTag:
                            tag += c;
                            break;
                        case State.ReadClass:
                            className += c;
                            break;
                        case State.ReadCondition:
                            condition += c;
                            break;
                        case State.ReadFunction:
                            func += c;
                            break;
                        case State.ReadFunctionArgument:
                            functionArgument += c;
                            break;
                        case State.Undefined:
                            throw "incorrect symbol for state: state: "+state+", index: "+i+", scss: "+partScss+"}";
                            break;
                        default:
                            throw "incorrect symbol for state: state: "+state+", index: "+i+", scss: "+partScss+"}";
                            break;
                    }
                    break;
            }
        }
        switch (state) {
            case State.Undefined:
            case State.ReadId:
            case State.ReadTag:
                break;
            case State.ReadClass:
                if (!className){
                    throw "incorrect symbol for state: state: "+state+", index: "+i+", scss: "+partScss+"}";
                }
                classNames.push(className);
                break;
//          case State.ReadCondition:
//              if (!className)
//                  throw "incorrect symbol for state: state: "+state+", index: "+i+", scss: "+partScss";
//              break;
            default:
                throw "incorrect symbol for state: state: "+state+", index: "+i+", scss: "+partScss+"}";
                break;
        }
        this.validate(tag, id, classNames, attributes, func, functionArgument);
        let isTrueCss = conditions.length == 0 &&
            subelementXpaths.length == 0 &&
            attributes.every(a => this.IsCssMatchStyle(a.matchStyle));

        let partXpath = this.aggregateToXpath(combinator, tag, id, classNames, attributes, conditions, subelementXpaths, func, functionArgument);
        let partCss = isTrueCss?combinator+partScss:undefined;

        return {
            tagName: tag,
            id: id,
            classNames: classNames,
            attributes: attributes,
            conditions: conditions,
            texts: texts,
            subelementXpaths: subelementXpaths,
            func: func,
            functionArgument: functionArgument,
            xpath: partXpath,
            css: partCss,
            scss: combinator + partScss,
            isCssStyle: true
        };
    },
    // private
    IsText(stringValue) {
        stringValue = stringValue[0] == '~' ? stringValue.slice(1) : stringValue;
        return stringValue.length > 1 &&
               ((stringValue.startsWith("'") && stringValue.endsWith("'")) ||
                (stringValue.startsWith("\"") && stringValue.endsWith("\"")));
    },
    // private
    IsNumber(condition) {
        return Number.isInteger(condition);
    },
    // private
    IsFunction(condition) {
        switch (condition) {
            case "last()":
                return true;
            default:
                return false;
        }
    },
    // private
    ParseAttribute(condition) {
        let attributeMatchStyle = ['=','~'];
        for(let i=0; i<attributeMatchStyle.length; i++) {
            let arr = condition.split(attributeMatchStyle[i]);
            if ((arr.length == 2) && (this.IsText(arr[1])))
                return {name: arr[0], value: arr[1], matchStyle: attributeMatchStyle[i]};
        }
        return null;
    },
    // private
    IsCssMatchStyle(matchStyle) {
        switch (matchStyle) {
            case '=':
                return true;
            default:
                return false;
        }
    },
    // private
    validate(tag, id, classNames, attributes, func, functionArgument) {
        if (tag) {
            this.ValidateIsElementName(tag);
        }
        if (id) {
            this.ValidateIsName(id);
        }
        for(let i=0; i<classNames.length; i++){
            this.ValidateIsIdent(classNames[i]);
        }
        for(let i=0; i<attributes.length; i++){
            this.ValidateIsIdent(attributes[i].name);
        }
        if (func) {
            this.ValidateIsCSSFunction(func, functionArgument);
        }
    },
    // private
    ValidateIsElementName(value) {
        if (!this.IsElementName(value)) {
            throw value + " is not element name";
        }
    },
    // private
    ValidateIsName(value) {
        if (!this.IsName(value)) {
            throw value + " is not name";
        }
    },
    // private
    ValidateIsIdent(value)
    {
        if (!this.IsIdent(value)) {
            throw value + " is not ident";
        }
    },
    // private
    ValidateIsCSSFunction(value, functionArgument) {
        switch (value) {
            case "contains":
                    this.ValidateIsContainsArgument(functionArgument);
                break;
            case "nth-child":
                    this.ValidateIsNthChildArgument(functionArgument);
                return;
            default:
                throw "'"+value+"' is not css function";
        }
    },
    // private
    ValidateIsContainsArgument(functionArgument) {
        if (!this.IsContainsArgument(functionArgument)) {
            throw "'"+functionArgument+"' is not valid argument for :contains function.";
        }
    },
    // private
    ValidateIsNthChildArgument(functionArgument) {
        if (!this.IsNthChildArgument(functionArgument)) {
            throw "'"+functionArgument+"' is not nth-child argument.";
        }
    },
    // private
    IsElementName(value) {
        // element_name : IDENT | '*'
        return value == "*" || this.IsIdent(value);
    },
    // private
    IsIdent(value) {
        let r = /^-?[_a-zA-Z][_a-zA-Z0-9-]*$/g.test(value);
        return r;
    },
    // private
    IsName(value) {
        let r = /^[_a-zA-Z0-9-]+$/g.test(value);
        return r;
    },
    // private
    IsContainsArgument(condition) {
        return /^'(?:.*)'$/g.test(condition);
    },
    // private
    IsNthChildArgument(condition) {
        let r = /^\d+(?:n(?:\+\d+)?)?$/g.test(condition);
        return r;
    },
    // private
    aggregateToXpath(axis, tag, id, classNames,
        attributes, conditions, subelementXpaths, func, functionArgument)
    {
        tag = !tag ? "*" : tag;
        let xpath = this.XpathAxis(axis) + tag;
        if (id) {
            xpath += this.XpathAttributeCondition("id", "'"+id+"'");
        }
        for (let i=0; i<classNames.length; i++) {
            xpath += this.XpathAttributeCondition("class", "'"+classNames[i]+"'", "~");
        }
        for (let i=0; i<attributes.length; i++) {
            xpath += this.XpathAttributeCondition(attributes[i].name, attributes[i].value, attributes[i].matchStyle);
        }
        for (let i=0; i<conditions.length; i++)
        {
            if (this.IsText(conditions[i])) {
                xpath += this.XpathTextCondition(conditions[i]);
            } else {
                xpath += this.XpathCondition(conditions[i]);
            }
        }
        for (let i=0; i<subelementXpaths.length; i++) {
            xpath += this.XpathCondition(subelementXpaths[i]);
        }
        if (func)
        {
            xpath += this.XpathFunction(func, functionArgument);
        }
        return xpath;
    },
    // private
    XpathFunction(func, functionArgument) {
        switch (func) {
            case "nth-child":
                return "["+functionArgument+"]";
            case "contains":
                return "[text()[contains(normalize-space(.),"+functionArgument+")]]";
            default:
                throw "ArgumentOutOfRangeException: function";
        }
    },
    // private
    XpathCondition(condition)
    {
        return "["+condition+"]";
    },
    // private
    XpathAxis(axis)
    {
        switch (axis)
        {
            case "":
            case " ":
                return "descendant::";
            case ">":
                return "child::";
            case "+":
                return "following-sibling::";
            default:
                throw "argument out of range: axis";
        }
    },
    // private
    XpathAttributeCondition(name, value, style = '=')
    {
        switch (style)
        {
            case '=':
                return "[@"+name+"="+value+"]";
            case '~':
                return "[contains(@"+name+","+value+")]";
            default:
                throw "argument out of range: style";
        }
    },
    // private
    XpathTextCondition(text)
    {
        if (text.startsWith("~")) {
            text = text[0] == '~' ? text.slice(1) : text;
            return "[text()[contains(normalize-space(.),"+text+")]]";
        }
        let textWithNoQuotes = text.slice(1,text.length-1);
        // TODO: need tests for this change
        if (textWithNoQuotes.includes("'")) {
            text = "\"" + textWithNoQuotes + "\"";
        }
        return "[text()[normalize-space(.)="+text+"]]";
    }

});
