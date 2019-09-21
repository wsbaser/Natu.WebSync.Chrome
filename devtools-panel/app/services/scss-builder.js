import Service from '@ember/service';

export default Service.extend({
    create(scssSelector) {
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
        try {
            parts = this.parseScss(scssSelector);
        } catch (e) {
            // Это не scss, возможно это xpath
            try {
                document.evaluate(scssSelector, document, null, XPathResult.ANY_TYPE, null);
            } catch (e) {
                throw "Invalid scss: " + scssSelector + ". " + e.description;
            }
            let xpathParts = this.splitScssToParts(scssSelector, ' ');
            parts=[];
            let fullXpath='';
            for (var i = 0; i < xpathParts.length; i++) {
                fullXpath+=xpathParts[i];
                parts.push({
                    index: i,
                    xpath: xpathParts[i],
                    fullXpath: fullXpath
                });
            }
        }
        let isValidCss = parts.every(p=>p.css);
        let css = isValidCss?parts.map(p=>p.css).join(' '):null;
        let xpath = parts.map(p=>p.xpath).join('');

        return {
            combineWithRoot: combineWithRoot,
            css: css,
            xpath: xpath,
            parts: parts,
        };
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
        for (let i = 0; i < scssSelector.length; i++) {
            let c = scssSelector[i];
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
            else if (delimiters.includes(c)) {
                if (!this.IsNullOrWhiteSpace(value)) {
                    parts.push(value);
                }
                value = '';
            }
            else if (c == '[') {
                readCondition = true;
            }
            else if (c == '(') {
                readFunctionArgument = true;
            }
            value += c;
        }
        if (!value
            || readCondition
            || readFunctionArgument) {
            throw "splitScssToParts: unexpected end of line";
        }
        parts.push(value);
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
    parseScss(scss) {
        let scssParts = this.splitScssToParts(scss, ' ', '>', '+');
        let parts=[];
        let fullCss='';
        let fullXpath=''
        for (let i = 0; i < scssParts.length; i++){
            let part = this.parseScssPart(scssParts[i]);
            part.index = i;
            if(i==0){
                part.xpath = "//" + this.RemoveDescendantAxis(part.xpath);
            }else{
                part.xpath = "/" + this.RemoveChildAxis(part.xpath);
            }
            fullXpath+=part.xpath;
            part.fullXpath=fullXpath;
            if(part.css){
                fullCss+=part.css;
                part.fullCss=fullCss;
            }
            parts.push(part);
        }
        
        return parts;
    },
    // private
    RemoveDescendantAxis(elementXpath)
    {
        if (elementXpath.startsWith("descendant::"))
            elementXpath = elementXpath.slice("descendant::".length);
        return elementXpath;
    },
    // private
    RemoveChildAxis(elementXpath)
    {
        if (elementXpath.startsWith("child::"))
            elementXpath = elementXpath.slice("child::".length);
        return elementXpath;
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
        let combinator = '';
        if ([' ','>','+'].includes(partScss[0])) {
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
                            if (!id)
                                throw "incorrect symbol for state: state: "+state+", index: "+i+", scss: "+partScss+"}";
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
                    if (id)
                        throw "two ids are illegal";
                    switch (state) {
                        case State.ReadClass:
                            if (!className)
                                throw "incorrect symbol for state: state: "+state+", index: "+i+", scss: "+partScss+"}";
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
                            if (!className)
                                throw "incorrect symbol for state: state: "+state+", index: "+i+", scss: "+partScss+"}";
                            classNames.push(className);
                            className = '';
                            break;
                        case State.ReadId:
                            if (!id)
                                throw "incorrect symbol for state: state: "+state+", index: "+i+", scss: "+partScss+"}";
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
                    if (state != State.ReadCondition)
                        throw "incorrect symbol for state: state: "+state+", index: "+i+", scss: "+partScss+"}";
                    if (this.IsText(condition)
                        || this.IsNumber(condition)
                        || this.IsFunction(condition)) {
                        // текстовое условие
                        conditions.push(condition);
                    } else {
                        let attribute = this.ParseAttribute(condition);
                        if (attribute != null) {
                            attributes.push(attribute);
                        } else {
                            // вложенный селектор
                            try {
                                let innerXpath = this.parseScss(condition).xpath;
                                subelementXpaths.push(this.RemoveChildAxis(innerXpath));
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
                    if (state != State.ReadFunction)
                        throw "incorrect symbol for state: state: "+state+", index: "+i+", scss: "+partScss+"}";
                    state = State.ReadFunctionArgument;
                    break;
                case ')':
                    if (state != State.ReadFunctionArgument)
                        throw "incorrect symbol for state: state: "+state+", index: "+i+", scss: "+partScss+"}";
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
                if (!className)
                    throw "incorrect symbol for state: state: "+state+", index: "+i+", scss: "+partScss+"}";
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
            tag: tag,
            id: id,
            classNames: classNames,
            attributes: attributes,
            conditions: conditions,
            subelementXpaths: subelementXpaths,
            func: func,
            functionArgument: functionArgument,
            xpath: partXpath,
            css: partCss
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
