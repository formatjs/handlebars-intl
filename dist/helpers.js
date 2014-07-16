(function() {
    "use strict";
    var $$core$$hop = Object.prototype.hasOwnProperty;

    var $$core$$realDefineProp = (function () {
        try { return !!Object.defineProperty({}, 'a', {}); }
        catch (e) { return false; }
    })();

    var $$core$$es3 = !$$core$$realDefineProp && !Object.prototype.__defineGetter__;

    var $$core$$defineProperty = $$core$$realDefineProp ? Object.defineProperty :
            function (obj, name, desc) {

        if ('get' in desc && obj.__defineGetter__) {
            obj.__defineGetter__(name, desc.get);
        } else if (!$$core$$hop.call(obj, name) || 'value' in desc) {
            obj[name] = desc.value;
        }
    };

    var $$core$$objCreate = Object.create || function (proto, props) {
        var obj, k;

        function F() {}
        F.prototype = proto;
        obj = new F();

        for (k in props) {
            if ($$core$$hop.call(props, k)) {
                $$core$$defineProperty(obj, k, props[k]);
            }
        }

        return obj;
    };

    var $$core$$fnBind = Function.prototype.bind || function (thisObj) {
        var fn   = this,
            args = [].slice.call(arguments, 1);

        return function () {
            fn.apply(thisObj, args.concat([].slice.call(arguments)));
        };
    };

    // -- MessageFormat --------------------------------------------------------

    function $$core$$MessageFormat(pattern, locales, formats) {
        // Parse string messages into a tokenized JSON structure for traversal.
        if (typeof pattern === 'string') {
            pattern = $$core$$MessageFormat.__parse(pattern);
        }

        if (!(pattern && typeof pattern.length === 'number')) {
            throw new TypeError('A pattern must be provided as a String or Array.');
        }

        // Creates a new object with the specified `formats` merged with the
        // default formats.
        formats = this._mergeFormats($$core$$MessageFormat.FORMATS, formats);

        // Defined first because it's used to build the format pattern.
        $$core$$defineProperty(this, '_locale',  {value: this._resolveLocale(locales)});

        // Define the `pattern` property, a compiled pattern that is highly
        // optimized for repeated `format()` invocations. **Note:** This passes
        // the `locales` set provided to the constructor instead of just the
        // resolved locale.
        pattern = this._compilePattern(pattern, locales, formats);
        $$core$$defineProperty(this, '_pattern', {value: pattern});

        // Bind `format()` method to `this` so it can be passed by reference
        // like the other `Intl` APIs.
        this.format = $$core$$fnBind.call(this.format, this);
    }

    // Default format options used as the prototype of the `formats` provided to
    // the constructor. These are used when constructing the internal
    // Intl.NumberFormat and Intl.DateTimeFormat instances.
    $$core$$defineProperty($$core$$MessageFormat, 'FORMATS', {
        enumerable: true,

        value: {
            number: {
                'currency': {
                    style: 'currency'
                },

                'percent': {
                    style: 'percent'
                }
            },

            date: {
                'short': {
                    month: 'numeric',
                    day  : 'numeric',
                    year : '2-digit'
                },

                'medium': {
                    month: 'short',
                    day  : 'numeric',
                    year : 'numeric'
                },

                'long': {
                    month: 'long',
                    day  : 'numeric',
                    year : 'numeric'
                },

                'full': {
                    weekday: 'long',
                    month  : 'long',
                    day    : 'numeric',
                    year   : 'numeric'
                }
            },

            time: {
                'short': {
                    hour  : 'numeric',
                    minute: 'numeric'
                },

                'medium':  {
                    hour  : 'numeric',
                    minute: 'numeric',
                    second: 'numeric'
                },

                'long': {
                    hour        : 'numeric',
                    minute      : 'numeric',
                    second      : 'numeric',
                    timeZoneName: 'short'
                },

                'full': {
                    hour        : 'numeric',
                    minute      : 'numeric',
                    second      : 'numeric',
                    timeZoneName: 'short'
                }
            }
        }
    });

    // Define internal private properties for dealing with locale data.
    $$core$$defineProperty($$core$$MessageFormat, '__availableLocales__', {value: []});

    $$core$$defineProperty($$core$$MessageFormat, '__localeData__', {value: $$core$$objCreate(null)});

    $$core$$defineProperty($$core$$MessageFormat, '__addLocaleData', {value: function (data) {
        if (!(data && data.locale)) {
            throw new Error('Object passed does not identify itself with a valid language tag');
        }

        if (!data.messageformat) {
            throw new Error('Object passed does not contain locale data for IntlMessageFormat');
        }

        var availableLocales = $$core$$MessageFormat.__availableLocales__,
            localeData       = $$core$$MessageFormat.__localeData__;

        // Message format locale data only requires the first part of the tag.
        var locale = data.locale.toLowerCase().split('-')[0];

        availableLocales.push(locale);
        localeData[locale] = data.messageformat;
    }});

    // Defines `__parse()` static method as an exposed private.
    $$core$$defineProperty($$core$$MessageFormat, '__parse', {value: $$core$$parse});

    // Define public `defaultLocale` property which is set when the first bundle
    // of locale data is added.
    $$core$$defineProperty($$core$$MessageFormat, 'defaultLocale', {
        enumerable: true,
        writable  : true,
        value: 'en'
    });

    $$core$$MessageFormat.prototype.format = function (values) {
        return this._format(this._pattern, values);
    };

    $$core$$MessageFormat.prototype.resolvedOptions = function () {
        // TODO: Provide anything else?
        return {
            locale: this._locale
        };
    };

    $$core$$MessageFormat.prototype._compilePattern = function (pattern, locales, formats) {
        // Wrap string patterns with an array for iteration control flow.
        if (typeof pattern === 'string') {
            pattern = [pattern];
        }

        var locale        = this._locale,
            localeData    = $$core$$MessageFormat.__localeData__,
            formatPattern = [],
            i, len, part, type, valueName, format, pluralFunction, options,
            key, optionsParts, option;

        for (i = 0, len = pattern.length; i < len; i += 1) {
            part = pattern[i];

            // Checks if string part is a simple string, or if it has a
            // tokenized place-holder that needs to be substituted.
            if (typeof part === 'string') {
                formatPattern.push($$core$$createStringPart(part));
                continue;
            }

            type      = part.type;
            valueName = part.valueName;
            options   = part.options;

            // Handles plural and select parts' options by building format
            // patterns for each option.
            if (options) {
                optionsParts = {};

                for (key in options) {
                    if (!$$core$$hop.call(options, key)) { continue; }

                    option = options[key];

                    // Early exit and special handling for plural options with a
                    // "${#}" token. These options will have this token replaced
                    // with NumberFormat wrap with optional prefix and suffix.
                    if (type === 'plural' && typeof option === 'string' &&
                            option.indexOf('${#}') >= 0) {

                        option = option.match(/(.*)\${#}(.*)/);

                        optionsParts[key] = [
                            option[1], // prefix
                            {
                                valueName: valueName,
                                format   : new Intl.NumberFormat(locales).format
                            },
                            option[2]  // suffix
                        ];

                        continue;
                    }

                    // Recursively compiles a format pattern for the option.
                    optionsParts[key] = this._compilePattern(option,
                            locales, formats);
                }
            }

            // Create a specialized format part for each type. This creates a
            // common interface for the `format()` method and encapsulates the
            // relevant data need for each type of formatting.
            switch (type) {
                case 'date':
                    format = formats.date[part.format];
                    formatPattern.push({
                        valueName: valueName,
                        format   : new Intl.DateTimeFormat(locales, format).format
                    });
                    break;

                case 'time':
                    format = formats.time[part.format];
                    formatPattern.push({
                        valueName: valueName,
                        format   : new Intl.DateTimeFormat(locales, format).format
                    });
                    break;

                case 'number':
                    format = formats.number[part.format];
                    formatPattern.push({
                        valueName: valueName,
                        format   : new Intl.NumberFormat(locales, format).format
                    });
                    break;

                case 'plural':
                    pluralFunction = localeData[locale].pluralFunction;
                    formatPattern.push(new $$core$$PluralPart(valueName, optionsParts,
                            pluralFunction));
                    break;

                case 'select':
                    formatPattern.push(new $$core$$SelectPart(valueName, optionsParts));
                    break;

                default:
                    throw new Error('Message pattern part at index ' + i + ' does not have a valid type');
            }
        }

        return formatPattern;
    };

    $$core$$MessageFormat.prototype._format = function (pattern, values) {
        var result = '',
            i, len, part, valueName, value, options;

        for (i = 0, len = pattern.length; i < len; i += 1) {
            part = pattern[i];

            // Exist early for string parts.
            if (typeof part === 'string') {
                result += part;
                continue;
            }

            valueName = part.valueName;

            // Enforce that all required values are provided by the caller.
            if (!(values && $$core$$hop.call(values, valueName))) {
                throw new Error('A value must be provided for: ' + valueName);
            }

            value   = values[valueName];
            options = part.options;

            // Recursively format plural and select parts' option — which can be
            // a nested pattern structure. The choosing of the option to use is
            // abstracted-by and delegated-to the part helper object.
            if (options) {
                result += this._format(part.getOption(value), values);
            } else {
                result += part.format(value);
            }
        }

        return result;
    };

    $$core$$MessageFormat.prototype._mergeFormats = function (defaults, formats) {
        var mergedFormats = {},
            type, mergedType;

        for (type in defaults) {
            if (!$$core$$hop.call(defaults, type)) { continue; }

            mergedFormats[type] = mergedType = $$core$$objCreate(defaults[type]);

            if (formats && $$core$$hop.call(formats, type)) {
                $$core$$extend(mergedType, formats[type]);
            }
        }

        return mergedFormats;
    };

    $$core$$MessageFormat.prototype._resolveLocale = function (locales) {
        var availableLocales = $$core$$MessageFormat.__availableLocales__,
            locale, parts, i, len;

        if (availableLocales.length === 0) {
            throw new Error('No locale data has been provided for IntlMessageFormat yet');
        }

        if (typeof locales === 'string') {
            locales = [locales];
        }

        if (locales && locales.length) {
            for (i = 0, len = locales.length; i < len; i += 1) {
                locale = locales[i].toLowerCase().split('-')[0];

                // Make sure the first part of the locale that we care about is
                // structurally valid.
                if (!/[a-z]{2,3}/i.test(locale)) {
                    throw new RangeError('"' + locales[i] + '" is not a structurally valid language tag');
                }

                if (availableLocales.indexOf(locale) >= 0) {
                    break;
                }
            }
        }

        return locale || $$core$$MessageFormat.defaultLocale;
    };

    // -- MessageFormat Helpers ------------------------------------------------

    var $$core$$RE_PARSED_TOKEN = /^\${([-\w]+)}$/;

    function $$core$$createStringPart(str) {
        var token = str.match($$core$$RE_PARSED_TOKEN);
        return token ? new $$core$$StringPart(token[1]) : str;
    }

    function $$core$$StringPart(valueName) {
        this.valueName = valueName;
    }

    $$core$$StringPart.prototype.format = function (value) {
        if (!value) {
            return '';
        }

        return typeof value === 'string' ? value : String(value);
    };

    function $$core$$SelectPart(valueName, options) {
        this.valueName = valueName;
        this.options   = options;
    }

    $$core$$SelectPart.prototype.getOption = function (value) {
        var options = this.options;
        return options[value] || options.other;
    };

    function $$core$$PluralPart(valueName, options, pluralFunction) {
        this.valueName      = valueName;
        this.options        = options;
        this.pluralFunction = pluralFunction;
    }

    $$core$$PluralPart.prototype.getOption = function (value) {
        var options = this.options,
            option  = this.pluralFunction(value);

        return options[option] || options.other;
    };

    // -- MessageFormat Parser -------------------------------------------------
    // Copied from: https://github.com/yahoo/locator-lang

    // `type` (required): The name of the message format type.
    // `regex` (required): The regex used to check if this formatter can parse the message.
    // `parse` (required): The main parse method which is given the full message.
    // `tokenParser` (optional): Used to parse the remaining tokens of a message (what remains after the variable and the format type).
    // `postParser` (optional): Used to format the output before returning from the main `parse` method.
    // `outputFormatter` (optional): Used to format the fully parsed string returned from the base case of the recursive parser.
    var $$core$$FORMATTERS = [
        {
            type: 'string',
            regex: /^{\s*([-\w]+)\s*}$/,
            parse: $$core$$formatElementParser,
            postParser: function (parsed) {
                return '${' + parsed.valueName + '}';
            }
        },
        {
            type: 'select',
            regex: /^{\s*([-\w]+)\s*,\s*select\s*,\s*(.*)\s*}$/,
            parse: $$core$$formatElementParser,
            tokenParser: $$core$$pairedOptionsParser
        },
        {
            type: 'plural',
            regex: /^{\s*([-\w]+)\s*,\s*plural\s*,\s*(.*)\s*}$/,
            parse: $$core$$formatElementParser,
            tokenParser: $$core$$pairedOptionsParser,
            outputFormatter: function (str) {
                return str.replace(/#/g, '${#}');
            }
        },
        {
            type: 'time',
            regex: /^{\s*([-\w]+)\s*,\s*time(?:,(.*))?\s*}$/,
            parse: $$core$$formatElementParser,
            tokenParser: $$core$$formatOptionParser,
            postParser: function (parsed) {
                parsed.format = parsed.format || 'medium';
                return parsed;
            }
        },
        {
            type: 'date',
            regex: /^{\s*([-\w]+)\s*,\s*date(?:,(.*))?\s*}$/,
            parse: $$core$$formatElementParser,
            tokenParser: $$core$$formatOptionParser,
            postParser: function (parsed) {
                parsed.format = parsed.format || 'medium';
                return parsed;
            }
        },
        {
            type: 'number',
            regex: /^{\s*([-\w]+)\s*,\s*number(?:,(.*))?\s*}$/,
            parse: $$core$$formatElementParser,
            tokenParser: $$core$$formatOptionParser
        },
        {
            type: 'custom',
            regex: /^{\s*([-\w]+)\s*,\s*([a-zA-Z]*)(?:,(.*))?\s*}$/,
            parse: $$core$$formatElementParser,
            tokenParser:$$core$$formatOptionParser
        }
    ];

    /**
     Tokenizes a MessageFormat pattern.
     @method tokenize
     @param {String} pattern A pattern
     @param {Boolean} trim Whether or not the tokens should be trimmed of whitespace
     @return {Array} Tokens
     **/
    function $$core$$tokenize (pattern, trim) {
        var bracketRE   = /[{}]/g,
            tokens      = [],
            balance     = 0,
            startIndex  = 0,
            endIndex,
            substr,
            match,
            i,
            len;


        match = bracketRE.exec(pattern);

        while (match) {
            // Keep track of balanced brackets
            balance += match[0] === '{' ? 1 : -1;

            // Imbalanced brackets detected (e.g. "}hello{", "{hello}}")
            if (balance < 0) {
                throw new Error('Imbalanced bracket detected at index ' +
                    match.index + ' for message "' + pattern + '"');
            }

            // Tokenize a pair of balanced brackets
            if (balance === 0) {
                endIndex = match.index + 1;

                tokens.push(
                    pattern.slice(startIndex, endIndex)
                );

                startIndex = endIndex;
            }

            // Tokenize any text that comes before the first opening bracket
            if (balance === 1 && startIndex !== match.index) {
                substr = pattern.slice(startIndex, match.index);
                if (substr.indexOf('{') === -1) {
                    tokens.push(substr);
                    startIndex = match.index;
                }
            }

            match = bracketRE.exec(pattern);
        }

        // Imbalanced brackets detected (e.g. "{{hello}")
        if (balance !== 0) {
            throw new Error('Brackets were not properly closed: ' + pattern);
        }

        // Tokenize any remaining non-empty string
        if (startIndex !== pattern.length) {
            tokens.push(
                pattern.slice(startIndex)
            );
        }

        if (trim) {
            for (i = 0, len = tokens.length; i < len; i++) {
                tokens[i] = tokens[i].replace(/^\s+|\s+$/gm, '');
            }
        }

        return tokens;
    }

    /**
     Gets the content of the format element by peeling off the outermost pair of
     brackets.
     @method getFormatElementContent
     @param {String} formatElement Format element
     @return {String} Contents of format element
     **/
    function $$core$$getFormatElementContent (formatElement) {
        return formatElement.replace(/^\{\s*/,'').replace(/\s*\}$/, '');
    }

    /**
     Checks if the pattern contains a format element.
     @method containsFormatElement
     @param {String} pattern Pattern
     @return {Boolean} Whether or not the pattern contains a format element
     **/
    function $$core$$containsFormatElement (pattern) {
        return pattern.indexOf('{') >= 0;
    }

    /**
     Parses a list of tokens into paired options where the key is the option name
     and the value is the pattern.
     @method pairedOptionsParser
     @param {Object} parsed Parsed object
     @param {Array} tokens Remaining tokens that come after the value name and the
         format id
     @return {Object} Parsed object with added options
     **/
    function $$core$$pairedOptionsParser (parsed, tokens) {
        var hasDefault,
            value,
            name,
            l,
            i;

        parsed.options  = {};

        if (tokens.length % 2) {
            throw new Error('Options must come in pairs: ' + tokens.join(', '));
        }

        for (i = 0, l = tokens.length; i < l; i += 2) {
            name  = tokens[i];
            value = tokens[i + 1];

            parsed.options[name] = value;

            hasDefault = hasDefault || name === 'other';
        }

        if (!hasDefault) {
            throw new Error('Options must include default "other" option: ' + tokens.join(', '));
        }

        return parsed;
    }

    function $$core$$formatOptionParser (parsed, tokens) {
        parsed.format = tokens[0];
        return parsed;
    }

    /**
     Parses a format element. Format elements are surrounded by curly braces, and
     contain at least a value name.
     @method formatElementParser
     @param {String} formatElement A format element
     @param {Object} match The result of a String.match() that has at least the
         value name at index 1 and a subformat at index 2
     @return {Object} Parsed object
     **/
    function $$core$$formatElementParser (formatElement, match, formatter) {
        var parsed = {
                type: formatter.type,
                valueName: match[1]
            },
            tokens = match[2] && $$core$$tokenize(match[2], true);

        // If there are any additional tokens to parse, it should be done here
        if (formatter.tokenParser && tokens) {
            parsed = formatter.tokenParser(parsed, tokens);
        }

        // Any final modifications to the parsed output should be done here
        if (formatter.postParser) {
            parsed = formatter.postParser(parsed);
        }

        return parsed;
    }

    /**
     For each formatter, test it on the token in order. Exit early on first
     token matched.
     @method parseToken
     @param {Array} tokens
     @param {Number} index
     @return {String|Object} Parsed token or original token
     */
    function $$core$$parseToken (tokens, index) {
        var i, len;

        for (i = 0, len = $$core$$FORMATTERS.length; i < len; i++) {
            if ($$core$$parseFormatTokens($$core$$FORMATTERS[i], tokens, index)) {
                return tokens[index];
            }
        }

        return tokens[index];
    }

    /**
     Attempts to parse a token at the given index with the provided formatter.
     If the token fails the `formatter.regex`, `false` is returned. Otherwise,
     the token is parsed with `formatter.parse`. Then if the token contains
     options due to the parsing process, it has each option processed. Then it
     returns `true` alerting the caller the token was parsed.

     @method parseFormatTokens
     @param {Object} formatter
     @param {Array} tokens
     @param {Number} tokenIndex
     @return {Boolean}
     */
    function $$core$$parseFormatTokens (formatter, tokens, tokenIndex) {
        var token = tokens[tokenIndex],
            match = token.match(formatter.regex),
            parsedToken,
            parsedKeys = [],
            key,
            i, len;

        if (match) {
            parsedToken = formatter.parse(token, match, formatter);
            tokens[tokenIndex] = parsedToken;

            // if we have options, each option must be parsed
            if (parsedToken && parsedToken.options && typeof parsedToken.options === 'object') {
                for (key in parsedToken.options) {
                    if (parsedToken.options.hasOwnProperty(key)) {
                        parsedKeys.push(key);
                    }
                }
            }

            for (i = 0, len = parsedKeys.length; i < len; i++) {
                $$core$$parseFormatOptions(parsedToken, parsedKeys[i], formatter);
            }

            return true;
        }

        return !!match;
    }

    /**
     @method parseFormatOptions
     @param {Object}
     */
    function $$core$$parseFormatOptions (parsedToken, key, formatter) {
        var value = parsedToken.options && parsedToken.options[key];
        value = $$core$$getFormatElementContent(value);
        parsedToken.options[key] = $$core$$parse(value, formatter.outputFormatter);
    }

    /**
     Parses a pattern that may contain nested format elements.
     @method parse
     @param {String} pattern A pattern
     @return {Object|Array} Parsed output
     **/
    function $$core$$parse (pattern, outputFormatter) {

        var tokens,
            i, len;

        // base case (plain string)
        if (!$$core$$containsFormatElement(pattern)) {
            // Final chance to format the string before the parser spits it out
            return outputFormatter ? outputFormatter(pattern) : [pattern];
        }

        tokens = $$core$$tokenize(pattern);

        for (i = 0, len = tokens.length; i < len; i++) {
            if (tokens[i].charAt(0) === '{') { // tokens must start with a {
                tokens[i] = $$core$$parseToken(tokens, i);
            }
        }

        return tokens;
    }

    // -- Utilities ------------------------------------------------------------

    function $$core$$extend(obj) {
        var sources = Array.prototype.slice.call(arguments, 1),
            i, len, source, key;

        for (i = 0, len = sources.length; i < len; i += 1) {
            source = sources[i];
            if (!source) { continue; }

            for (key in source) {
                if (source.hasOwnProperty(key)) {
                    obj[key] = source[key];
                }
            }
        }

        return obj;
    }

    var $$core$$default = $$core$$MessageFormat;

    var intl$messageformat$$funcs = [
    function (n) {  },
    function (n) { n=Math.floor(n);if(n===1)return"one";return"other"; },
    function (n) { n=Math.floor(n);if(n>=0&&n<=1)return"one";return"other"; },
    function (n) { var i=Math.floor(Math.abs(n));n=Math.floor(n);if(i===0||n===1)return"one";return"other"; },
    function (n) { n=Math.floor(n);if(n===0)return"zero";if(n===1)return"one";if(n===2)return"two";if(n%100>=3&&n%100<=10)return"few";if(n%100>=11&&n%100<=99)return"many";return"other"; },
    function (n) { n=Math.floor(n);if(n%10===1&&(n%100!==11))return"one";if(n%10>=2&&n%10<=4&&!(n%100>=12&&n%100<=14))return"few";if(n%10===0||n%10>=5&&n%10<=9||n%100>=11&&n%100<=14)return"many";return"other"; },
    function (n) { return"other"; },
    function (n) { n=Math.floor(n);if(n%10===1&&!(n%100===11||n%100===71||n%100===91))return"one";if(n%10===2&&!(n%100===12||n%100===72||n%100===92))return"two";if((n%10>=3&&n%10<=4||n%10===9)&&!(n%100>=10&&n%100<=19||n%100>=70&&n%100<=79||n%100>=90&&n%100<=99))return"few";if((n!==0)&&n%1e6===0)return"many";return"other"; },
    function (n) { var i=Math.floor(Math.abs(n)),v=n.toString().replace(/^[^.]*\.?/,"").length,f=parseInt(n.toString().replace(/^[^.]*\.?/,""),10);n=Math.floor(n);if(v===0&&i%10===1&&((i%100!==11)||f%10===1&&(f%100!==11)))return"one";if(v===0&&i%10>=2&&i%10<=4&&(!(i%100>=12&&i%100<=14)||f%10>=2&&f%10<=4&&!(f%100>=12&&f%100<=14)))return"few";return"other"; },
    function (n) { var i=Math.floor(Math.abs(n)),v=n.toString().replace(/^[^.]*\.?/,"").length;n=Math.floor(n);if(i===1&&v===0)return"one";return"other"; },
    function (n) { var i=Math.floor(Math.abs(n)),v=n.toString().replace(/^[^.]*\.?/,"").length;n=Math.floor(n);if(i===1&&v===0)return"one";if(i>=2&&i<=4&&v===0)return"few";if((v!==0))return"many";return"other"; },
    function (n) { n=Math.floor(n);if(n===0)return"zero";if(n===1)return"one";if(n===2)return"two";if(n===3)return"few";if(n===6)return"many";return"other"; },
    function (n) { var i=Math.floor(Math.abs(n)),t=parseInt(n.toString().replace(/^[^.]*\.?|0+$/g,""),10);n=Math.floor(n);if(n===1||(t!==0)&&(i===0||i===1))return"one";return"other"; },
    function (n) { var i=Math.floor(Math.abs(n));n=Math.floor(n);if(i===0||i===1)return"one";return"other"; },
    function (n) { var i=Math.floor(Math.abs(n)),v=n.toString().replace(/^[^.]*\.?/,"").length;n=Math.floor(n);if(i>=0&&i<=1&&v===0)return"one";return"other"; },
    function (n) { n=Math.floor(n);if(n===1)return"one";if(n===2)return"two";if(n>=3&&n<=6)return"few";if(n>=7&&n<=10)return"many";return"other"; },
    function (n) { n=Math.floor(n);if(n===1||n===11)return"one";if(n===2||n===12)return"two";if(n>=3&&n<=10||n>=13&&n<=19)return"few";return"other"; },
    function (n) { n=Math.floor(n);if(n%10===1)return"one";if(n%10===2)return"two";if(n%100===0||n%100===20||n%100===40||n%100===60)return"few";return"other"; },
    function (n) { var i=Math.floor(Math.abs(n)),v=n.toString().replace(/^[^.]*\.?/,"").length;n=Math.floor(n);if(i===1&&v===0)return"one";if(i===2&&v===0)return"two";if(v===0&&!(n>=0&&n<=10)&&n%10===0)return"many";return"other"; },
    function (n) { var i=Math.floor(Math.abs(n)),t=parseInt(n.toString().replace(/^[^.]*\.?|0+$/g,""),10);n=Math.floor(n);if(t===0&&i%10===1&&((i%100!==11)||(t!==0)))return"one";return"other"; },
    function (n) { n=Math.floor(n);if(n===0)return"zero";if(n===1)return"one";return"other"; },
    function (n) { n=Math.floor(n);if(n===1)return"one";if(n===2)return"two";return"other"; },
    function (n) { var i=Math.floor(Math.abs(n));n=Math.floor(n);if(n===0)return"zero";if((i===0||i===1)&&(n!==0))return"one";return"other"; },
    function (n) { var f=parseInt(n.toString().replace(/^[^.]*\.?/,""),10);n=Math.floor(n);if(n%10===1&&!(n%100>=11&&n%100<=19))return"one";if(n%10>=2&&n%10<=9&&!(n%100>=11&&n%100<=19))return"few";if((f!==0))return"many";return"other"; },
    function (n) { var v=n.toString().replace(/^[^.]*\.?/,"").length,f=parseInt(n.toString().replace(/^[^.]*\.?/,""),10);n=Math.floor(n);if(n%10===0||n%100>=11&&n%100<=19||v===2&&f%100>=11&&f%100<=19)return"zero";if(n%10===1&&((n%100!==11)||v===2&&f%10===1&&((f%100!==11)||(v!==2)&&f%10===1)))return"one";return"other"; },
    function (n) { var i=Math.floor(Math.abs(n)),v=n.toString().replace(/^[^.]*\.?/,"").length,f=parseInt(n.toString().replace(/^[^.]*\.?/,""),10);n=Math.floor(n);if(v===0&&(i%10===1||f%10===1))return"one";return"other"; },
    function (n) { n=Math.floor(n);if(n===1)return"one";if(n===0||n%100>=2&&n%100<=10)return"few";if(n%100>=11&&n%100<=19)return"many";return"other"; },
    function (n) { var i=Math.floor(Math.abs(n)),v=n.toString().replace(/^[^.]*\.?/,"").length;n=Math.floor(n);if(i===1&&v===0)return"one";if(v===0&&i%10>=2&&i%10<=4&&!(i%100>=12&&i%100<=14))return"few";if(v===0&&(i!==1)&&(i%10>=0&&i%10<=1||v===0&&(i%10>=5&&i%10<=9||v===0&&i%100>=12&&i%100<=14)))return"many";return"other"; },
    function (n) { var i=Math.floor(Math.abs(n)),v=n.toString().replace(/^[^.]*\.?/,"").length,t=parseInt(n.toString().replace(/^[^.]*\.?|0+$/g,""),10);n=Math.floor(n);if(i===1&&(v===0||i===0&&t===1))return"one";return"other"; },
    function (n) { var i=Math.floor(Math.abs(n)),v=n.toString().replace(/^[^.]*\.?/,"").length;n=Math.floor(n);if(i===1&&v===0)return"one";if((v!==0)||n===0||(n!==1)&&n%100>=1&&n%100<=19)return"few";return"other"; },
    function (n) { var i=Math.floor(Math.abs(n)),v=n.toString().replace(/^[^.]*\.?/,"").length;n=Math.floor(n);if(v===0&&i%10===1&&(i%100!==11))return"one";if(v===0&&(i%10===0||v===0&&(i%10>=5&&i%10<=9||v===0&&i%100>=11&&i%100<=14)))return"many";return"other"; },
    function (n) { var i=Math.floor(Math.abs(n));n=Math.floor(n);if(i===0||n===1)return"one";if(n>=2&&n<=10)return"few";return"other"; },
    function (n) { var i=Math.floor(Math.abs(n)),f=parseInt(n.toString().replace(/^[^.]*\.?/,""),10);n=Math.floor(n);if(n===0||n===1||i===0&&f===1)return"one";return"other"; },
    function (n) { var i=Math.floor(Math.abs(n)),v=n.toString().replace(/^[^.]*\.?/,"").length;n=Math.floor(n);if(v===0&&i%100===1)return"one";if(v===0&&i%100===2)return"two";if(v===0&&(i%100>=3&&i%100<=4||(v!==0)))return"few";return"other"; },
    function (n) { n=Math.floor(n);if(n>=0&&n<=1||n>=11&&n<=99)return"one";return"other"; },
    function (n) { var i=Math.floor(Math.abs(n)),v=n.toString().replace(/^[^.]*\.?/,"").length;n=Math.floor(n);if(v===0&&i%10===1&&(i%100!==11))return"one";if(v===0&&i%10>=2&&i%10<=4&&!(i%100>=12&&i%100<=14))return"few";if(v===0&&(i%10===0||v===0&&(i%10>=5&&i%10<=9||v===0&&i%100>=11&&i%100<=14)))return"many";return"other"; }
    ];

    $$core$$default.__addLocaleData({locale:"aa", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"af", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"agq", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"ak", messageformat:{pluralFunction:intl$messageformat$$funcs[2]}});
    $$core$$default.__addLocaleData({locale:"am", messageformat:{pluralFunction:intl$messageformat$$funcs[3]}});
    $$core$$default.__addLocaleData({locale:"ar", messageformat:{pluralFunction:intl$messageformat$$funcs[4]}});
    $$core$$default.__addLocaleData({locale:"as", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"asa", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"ast", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"az", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"bas", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"be", messageformat:{pluralFunction:intl$messageformat$$funcs[5]}});
    $$core$$default.__addLocaleData({locale:"bem", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"bez", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"bg", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"bm", messageformat:{pluralFunction:intl$messageformat$$funcs[6]}});
    $$core$$default.__addLocaleData({locale:"bn", messageformat:{pluralFunction:intl$messageformat$$funcs[3]}});
    $$core$$default.__addLocaleData({locale:"bo", messageformat:{pluralFunction:intl$messageformat$$funcs[6]}});
    $$core$$default.__addLocaleData({locale:"br", messageformat:{pluralFunction:intl$messageformat$$funcs[7]}});
    $$core$$default.__addLocaleData({locale:"brx", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"bs", messageformat:{pluralFunction:intl$messageformat$$funcs[8]}});
    $$core$$default.__addLocaleData({locale:"byn", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"ca", messageformat:{pluralFunction:intl$messageformat$$funcs[9]}});
    $$core$$default.__addLocaleData({locale:"cgg", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"chr", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"cs", messageformat:{pluralFunction:intl$messageformat$$funcs[10]}});
    $$core$$default.__addLocaleData({locale:"cy", messageformat:{pluralFunction:intl$messageformat$$funcs[11]}});
    $$core$$default.__addLocaleData({locale:"da", messageformat:{pluralFunction:intl$messageformat$$funcs[12]}});
    $$core$$default.__addLocaleData({locale:"dav", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"de", messageformat:{pluralFunction:intl$messageformat$$funcs[9]}});
    $$core$$default.__addLocaleData({locale:"dje", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"dua", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"dyo", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"dz", messageformat:{pluralFunction:intl$messageformat$$funcs[6]}});
    $$core$$default.__addLocaleData({locale:"ebu", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"ee", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"el", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"en", messageformat:{pluralFunction:intl$messageformat$$funcs[9]}});
    $$core$$default.__addLocaleData({locale:"eo", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"es", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"et", messageformat:{pluralFunction:intl$messageformat$$funcs[9]}});
    $$core$$default.__addLocaleData({locale:"eu", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"ewo", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"fa", messageformat:{pluralFunction:intl$messageformat$$funcs[3]}});
    $$core$$default.__addLocaleData({locale:"ff", messageformat:{pluralFunction:intl$messageformat$$funcs[13]}});
    $$core$$default.__addLocaleData({locale:"fi", messageformat:{pluralFunction:intl$messageformat$$funcs[14]}});
    $$core$$default.__addLocaleData({locale:"fil", messageformat:{pluralFunction:intl$messageformat$$funcs[14]}});
    $$core$$default.__addLocaleData({locale:"fo", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"fr", messageformat:{pluralFunction:intl$messageformat$$funcs[13]}});
    $$core$$default.__addLocaleData({locale:"fur", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"ga", messageformat:{pluralFunction:intl$messageformat$$funcs[15]}});
    $$core$$default.__addLocaleData({locale:"gd", messageformat:{pluralFunction:intl$messageformat$$funcs[16]}});
    $$core$$default.__addLocaleData({locale:"gl", messageformat:{pluralFunction:intl$messageformat$$funcs[9]}});
    $$core$$default.__addLocaleData({locale:"gsw", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"gu", messageformat:{pluralFunction:intl$messageformat$$funcs[3]}});
    $$core$$default.__addLocaleData({locale:"guz", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"gv", messageformat:{pluralFunction:intl$messageformat$$funcs[17]}});
    $$core$$default.__addLocaleData({locale:"ha", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"haw", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"he", messageformat:{pluralFunction:intl$messageformat$$funcs[18]}});
    $$core$$default.__addLocaleData({locale:"hi", messageformat:{pluralFunction:intl$messageformat$$funcs[3]}});
    $$core$$default.__addLocaleData({locale:"hr", messageformat:{pluralFunction:intl$messageformat$$funcs[8]}});
    $$core$$default.__addLocaleData({locale:"hu", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"hy", messageformat:{pluralFunction:intl$messageformat$$funcs[13]}});
    $$core$$default.__addLocaleData({locale:"ia", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"id", messageformat:{pluralFunction:intl$messageformat$$funcs[6]}});
    $$core$$default.__addLocaleData({locale:"ig", messageformat:{pluralFunction:intl$messageformat$$funcs[6]}});
    $$core$$default.__addLocaleData({locale:"ii", messageformat:{pluralFunction:intl$messageformat$$funcs[6]}});
    $$core$$default.__addLocaleData({locale:"is", messageformat:{pluralFunction:intl$messageformat$$funcs[19]}});
    $$core$$default.__addLocaleData({locale:"it", messageformat:{pluralFunction:intl$messageformat$$funcs[9]}});
    $$core$$default.__addLocaleData({locale:"ja", messageformat:{pluralFunction:intl$messageformat$$funcs[6]}});
    $$core$$default.__addLocaleData({locale:"jgo", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"jmc", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"ka", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"kab", messageformat:{pluralFunction:intl$messageformat$$funcs[13]}});
    $$core$$default.__addLocaleData({locale:"kam", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"kde", messageformat:{pluralFunction:intl$messageformat$$funcs[6]}});
    $$core$$default.__addLocaleData({locale:"kea", messageformat:{pluralFunction:intl$messageformat$$funcs[6]}});
    $$core$$default.__addLocaleData({locale:"khq", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"ki", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"kk", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"kkj", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"kl", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"kln", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"km", messageformat:{pluralFunction:intl$messageformat$$funcs[6]}});
    $$core$$default.__addLocaleData({locale:"kn", messageformat:{pluralFunction:intl$messageformat$$funcs[3]}});
    $$core$$default.__addLocaleData({locale:"ko", messageformat:{pluralFunction:intl$messageformat$$funcs[6]}});
    $$core$$default.__addLocaleData({locale:"kok", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"ks", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"ksb", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"ksf", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"ksh", messageformat:{pluralFunction:intl$messageformat$$funcs[20]}});
    $$core$$default.__addLocaleData({locale:"kw", messageformat:{pluralFunction:intl$messageformat$$funcs[21]}});
    $$core$$default.__addLocaleData({locale:"ky", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"lag", messageformat:{pluralFunction:intl$messageformat$$funcs[22]}});
    $$core$$default.__addLocaleData({locale:"lg", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"lkt", messageformat:{pluralFunction:intl$messageformat$$funcs[6]}});
    $$core$$default.__addLocaleData({locale:"ln", messageformat:{pluralFunction:intl$messageformat$$funcs[2]}});
    $$core$$default.__addLocaleData({locale:"lo", messageformat:{pluralFunction:intl$messageformat$$funcs[6]}});
    $$core$$default.__addLocaleData({locale:"lt", messageformat:{pluralFunction:intl$messageformat$$funcs[23]}});
    $$core$$default.__addLocaleData({locale:"lu", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"luo", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"luy", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"lv", messageformat:{pluralFunction:intl$messageformat$$funcs[24]}});
    $$core$$default.__addLocaleData({locale:"mas", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"mer", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"mfe", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"mg", messageformat:{pluralFunction:intl$messageformat$$funcs[2]}});
    $$core$$default.__addLocaleData({locale:"mgh", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"mgo", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"mk", messageformat:{pluralFunction:intl$messageformat$$funcs[25]}});
    $$core$$default.__addLocaleData({locale:"ml", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"mn", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"mr", messageformat:{pluralFunction:intl$messageformat$$funcs[3]}});
    $$core$$default.__addLocaleData({locale:"ms", messageformat:{pluralFunction:intl$messageformat$$funcs[6]}});
    $$core$$default.__addLocaleData({locale:"mt", messageformat:{pluralFunction:intl$messageformat$$funcs[26]}});
    $$core$$default.__addLocaleData({locale:"mua", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"my", messageformat:{pluralFunction:intl$messageformat$$funcs[6]}});
    $$core$$default.__addLocaleData({locale:"naq", messageformat:{pluralFunction:intl$messageformat$$funcs[21]}});
    $$core$$default.__addLocaleData({locale:"nb", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"nd", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"ne", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"nl", messageformat:{pluralFunction:intl$messageformat$$funcs[9]}});
    $$core$$default.__addLocaleData({locale:"nmg", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"nn", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"nnh", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"nr", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"nso", messageformat:{pluralFunction:intl$messageformat$$funcs[2]}});
    $$core$$default.__addLocaleData({locale:"nus", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"nyn", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"om", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"or", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"os", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"pa", messageformat:{pluralFunction:intl$messageformat$$funcs[2]}});
    $$core$$default.__addLocaleData({locale:"pl", messageformat:{pluralFunction:intl$messageformat$$funcs[27]}});
    $$core$$default.__addLocaleData({locale:"ps", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"pt", messageformat:{pluralFunction:intl$messageformat$$funcs[28]}});
    $$core$$default.__addLocaleData({locale:"rm", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"rn", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"ro", messageformat:{pluralFunction:intl$messageformat$$funcs[29]}});
    $$core$$default.__addLocaleData({locale:"rof", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"ru", messageformat:{pluralFunction:intl$messageformat$$funcs[30]}});
    $$core$$default.__addLocaleData({locale:"rw", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"rwk", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"sah", messageformat:{pluralFunction:intl$messageformat$$funcs[6]}});
    $$core$$default.__addLocaleData({locale:"saq", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"sbp", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"se", messageformat:{pluralFunction:intl$messageformat$$funcs[21]}});
    $$core$$default.__addLocaleData({locale:"seh", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"ses", messageformat:{pluralFunction:intl$messageformat$$funcs[6]}});
    $$core$$default.__addLocaleData({locale:"sg", messageformat:{pluralFunction:intl$messageformat$$funcs[6]}});
    $$core$$default.__addLocaleData({locale:"shi", messageformat:{pluralFunction:intl$messageformat$$funcs[31]}});
    $$core$$default.__addLocaleData({locale:"si", messageformat:{pluralFunction:intl$messageformat$$funcs[32]}});
    $$core$$default.__addLocaleData({locale:"sk", messageformat:{pluralFunction:intl$messageformat$$funcs[10]}});
    $$core$$default.__addLocaleData({locale:"sl", messageformat:{pluralFunction:intl$messageformat$$funcs[33]}});
    $$core$$default.__addLocaleData({locale:"sn", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"so", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"sq", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"sr", messageformat:{pluralFunction:intl$messageformat$$funcs[8]}});
    $$core$$default.__addLocaleData({locale:"ss", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"ssy", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"st", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"sv", messageformat:{pluralFunction:intl$messageformat$$funcs[9]}});
    $$core$$default.__addLocaleData({locale:"sw", messageformat:{pluralFunction:intl$messageformat$$funcs[9]}});
    $$core$$default.__addLocaleData({locale:"swc", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"ta", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"te", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"teo", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"tg", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"th", messageformat:{pluralFunction:intl$messageformat$$funcs[6]}});
    $$core$$default.__addLocaleData({locale:"ti", messageformat:{pluralFunction:intl$messageformat$$funcs[2]}});
    $$core$$default.__addLocaleData({locale:"tig", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"tn", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"to", messageformat:{pluralFunction:intl$messageformat$$funcs[6]}});
    $$core$$default.__addLocaleData({locale:"tr", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"ts", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"twq", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"tzm", messageformat:{pluralFunction:intl$messageformat$$funcs[34]}});
    $$core$$default.__addLocaleData({locale:"uk", messageformat:{pluralFunction:intl$messageformat$$funcs[35]}});
    $$core$$default.__addLocaleData({locale:"ur", messageformat:{pluralFunction:intl$messageformat$$funcs[9]}});
    $$core$$default.__addLocaleData({locale:"uz", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"vai", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"ve", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"vi", messageformat:{pluralFunction:intl$messageformat$$funcs[6]}});
    $$core$$default.__addLocaleData({locale:"vo", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"vun", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"wae", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"wal", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"xh", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"xog", messageformat:{pluralFunction:intl$messageformat$$funcs[1]}});
    $$core$$default.__addLocaleData({locale:"yav", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"yo", messageformat:{pluralFunction:intl$messageformat$$funcs[6]}});
    $$core$$default.__addLocaleData({locale:"zgh", messageformat:{pluralFunction:intl$messageformat$$funcs[0]}});
    $$core$$default.__addLocaleData({locale:"zh", messageformat:{pluralFunction:intl$messageformat$$funcs[6]}});
    $$core$$default.__addLocaleData({locale:"zu", messageformat:{pluralFunction:intl$messageformat$$funcs[3]}});
    var intl$messageformat$$default = $$core$$default;

    function $$helper$$registerWith(Handlebars) {
        var SafeString  = Handlebars.SafeString,
            createFrame = Handlebars.createFrame,
            escape      = Handlebars.Utils.escapeExpression;

        var helpers = {
            intl           : intl,
            intlDate       : intlDate,
            intlNumber     : intlNumber,
            intlGet        : intlGet,
            intlMessage    : intlMessage,
            intlHTMLMessage: intlHTMLMessage
        }, name;

        for (name in helpers) {
            if (helpers.hasOwnProperty(name)) {
                Handlebars.registerHelper(name, helpers[name]);
            }
        }

        // -- Helpers ----------------------------------------------------------

        function intl(options) {
            /* jshint validthis:true */

            if (!options.fn) {
                throw new ReferenceError('{{#intl}} must be invoked as a block helper');
            }

            // Create a new data frame linked the parent and create a new intl
            // data object and extend it with `options.data.intl` and
            // `options.hash`.
            var data     = createFrame(options.data),
                intlData = $$helper$$extend({}, data.intl, options.hash);

            data.intl = intlData;

            return options.fn(this, {data: data});
        }

        function intlDate(date, formatOptions, options) {
            date = new Date(date);

            // Determine if the `date` is valid.
            if (!(date && date.getTime())) {
                throw new TypeError('A date must be provided.');
            }

            if (!options) {
                options       = formatOptions;
                formatOptions = null;
            }

            var hash    = options.hash,
                data    = options.data,
                locales = data.intl && data.intl.locales;

            if (formatOptions) {
                if (typeof formatOptions === 'string') {
                    formatOptions = intlGet('formats.date.' + formatOptions, options);
                }

                formatOptions = $$helper$$extend({}, formatOptions, hash);
            } else {
                formatOptions = hash;
            }

            return $$helper$$getFormat('date', locales, formatOptions).format(date);
        }

        function intlNumber(num, formatOptions, options) {
            if (typeof num !== 'number') {
                throw new TypeError('A number must be provided.');
            }

            if (!options) {
                options       = formatOptions;
                formatOptions = null;
            }

            var hash    = options.hash,
                data    = options.data,
                locales = data.intl && data.intl.locales;

            if (formatOptions) {
                if (typeof formatOptions === 'string') {
                    formatOptions = intlGet('formats.number.' + formatOptions, options);
                }

                formatOptions = $$helper$$extend({}, formatOptions, hash);
            } else {
                formatOptions = hash;
            }

            return $$helper$$getFormat('number', locales, formatOptions).format(num);
        }

        function intlGet(path, options) {
            var intlData  = options.data && options.data.intl,
                pathParts = path.split('.'),
                obj, len, i;

            // Use the path to walk the Intl data to find the object at the
            // given path, and throw a descriptive error if it's not found.
            try {
                for (i = 0, len = pathParts.length; i < len; i++) {
                    obj = intlData = intlData[pathParts[i]];
                }
            } finally {
                if (obj === undefined) {
                    throw new ReferenceError('Could not find Intl object: ' + path);
                }
            }

            return obj;
        }

        function intlMessage(message, options) {
            if (!options) {
                options = message;
                message = null;
            }

            var hash = options.hash;

            // Support a message being passed as a string argument or pre-prased
            // array. When there's no `message` argument, ensure a message path
            // name was provided at `intlName` in the `hash`.
            //
            // TODO: remove support form `hash.intlName` once Handlebars bugs
            // with subexpressions are fixed.
            if (!(message || typeof message === 'string' || hash.intlName)) {
                throw new ReferenceError('{{intlMessage}} must be provided a message or intlName');
            }

            var intlData = options.data.intl || {},
                locales  = intlData.locales,
                formats  = intlData.formats;

            // Lookup message by path name. User must supply the full path to
            // the message on `options.data.intl`.
            if (!message && hash.intlName) {
                message = intlGet(hash.intlName, options);
            }

            // When `message` is a function, assume it's an IntlMessageFormat
            // instance's `format()` method passed by reference, and call it.
            // This is possible because its `this` will be pre-bound to the
            // instance.
            if (typeof message === 'function') {
                return message(hash);
            }

            // Assume that an object with a `format()` method is already an
            // IntlMessageFormat instance, and use it; otherwise create a new
            // one.
            if (typeof message.format !== 'function') {
                message = new intl$messageformat$$default(message, locales, formats);
            }

            return message.format(hash);
        }

        function intlHTMLMessage() {
            /* jshint validthis:true */
            var options = [].slice.call(arguments).pop(),
                hash    = options.hash,
                key, value;

            // Replace string properties in `options.hash` with HTML-escaped
            // strings.
            for (key in hash) {
                if (hash.hasOwnProperty(key)) {
                    value = hash[key];

                    // Escape string value.
                    if (typeof value === 'string') {
                        hash[key] = escape(value);
                    }
                }
            }

            // Return a Handlebars `SafeString`. This first unwraps the result
            // to make sure it's not returning a double-wrapped `SafeString`.
            return new SafeString(String(intlMessage.apply(this, arguments)));
        }
    }

    // -- Internals ------------------------------------------------------------

    // Cache to hold NumberFormat and DateTimeFormat instances for reuse.
    var $$helper$$formats = {
        number: {},
        date  : {}
    };

    function $$helper$$getFormat(type, locales, options) {
        var orderedOptions, option, key, i, len, id, format;

        // When JSON is available in the environment, use it build a cache-id
        // to reuse formats for increased performance.
        if (JSON) {
            // Order the keys in `options` to create a serialized semantic
            // representation which is reproducible.
            if (options) {
                orderedOptions = [];

                for (key in options) {
                    if (options.hasOwnProperty(key)) {
                        orderedOptions.push(key);
                    }
                }

                orderedOptions.sort();

                for (i = 0, len = orderedOptions.length; i < len; i += 1) {
                    key    = orderedOptions[i];
                    option = {};

                    option[key] = options[key];
                    orderedOptions[i] = option;
                }
            }

            id = JSON.stringify([locales, orderedOptions]);
        }

        // Check for a cached format instance, and use it.
        format = $$helper$$formats[type][id];
        if (format) { return format; }

        switch (type) {
            case 'number':
                format = new Intl.NumberFormat(locales, options);
                break;
            case 'date':
                format = new Intl.DateTimeFormat(locales, options);
                break;
        }

        // Cache format for reuse.
        if (id) {
            $$helper$$formats[type][id] = format;
        }

        return format;
    }

    // -- Utilities ------------------------------------------------------------

    function $$helper$$extend(obj) {
        var sources = Array.prototype.slice.call(arguments, 1),
            i, len, source, key;

        for (i = 0, len = sources.length; i < len; i += 1) {
            source = sources[i];
            if (!source) { continue; }

            for (key in source) {
                if (source.hasOwnProperty(key)) {
                    obj[key] = source[key];
                }
            }
        }

        return obj;
    }

    var $$helper$$default = $$helper$$registerWith;

    var src$umd$$mod = {
        registerWith: $$helper$$default
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define.amd) {
      define(function() { return src$umd$$mod; });
    } else if (typeof module !== 'undefined' && module.exports) {
      module.exports = src$umd$$mod;
    } else if (typeof this !== 'undefined') {
      this.HandlebarsHelperIntl = src$umd$$mod;
    }
}).call(this);