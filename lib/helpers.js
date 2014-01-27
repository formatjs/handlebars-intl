(function (root, factory) {
    // factory requires Intl and MessageFormat to be passed to it
    // Inlt can be the system Intl or an Intl polyfill assigned to root.Intl
    // MessageFormat can be MessageFormat on the Intl namespace or an IntlMessageFormat polyfill
    var lib = factory(root.Intl, (root.Intl && root.Intl.MessageFormat) || root.IntlMessageFormat);

    if (typeof module === 'object' && module.exports) {
        // node.js/CommonJs
        module.exports = lib;
    }
    if (typeof define === 'function' && define.amd) {
        // AMD anonymous module
        define(lib);
    }
    if (root) {
        root.HandlebarsHelperIntl = lib;
    }
})(typeof global !== 'undefined' ? global : this, function (Intl, IntlMessageFormat) {

    if (!Intl) {
        throw new ReferenceError('Intl must be provided.');
    }

    if (!IntlMessageFormat) {
        throw new ReferenceError('IntlMessageFormat must be provided.');
    }

    // Utility method used to avoid manipulating options.hash
    function extend (receiver, sender) {
        var p;

        for (p in sender) {
            if (sender.hasOwnProperty(p)) {
                receiver[p] = sender[p];
            }
        }

        return receiver;
    }

    var defaults = {},
        _dateTimeFormats = {},
        _numberFormats = {};


    /**
     Sets options for Intl.DateTimeFormat to a specified key. The key can then
     be used with `intlDate` as `{{intlDate format="key"}}`
     @method setDateTimeFormat
     @param {String} key
     @param {Object} options
     */
    function setDateTimeFormat (key, options) {
        _dateTimeFormats[key] = options;
    }

    /**
     Returns the DateTimeFormat options for the specified key, or null if the
     key is not found
     @method getDateTimeFormat
     @param {String} key
     @return {Object|null}
     */
    function getDateTimeFormat (key) {
        return _dateTimeFormats[key] || null;
    }

    /**
     Sets options for Intl.NumberFormat to a specified key. The key can then
     be used with `intlNum` as `{{intlNum format="key"}}`
     @method setNumberFormat
     @param {String} key
     @param {Object} options
     */
    function setNumberFormat (key, options) {
        _numberFormats[key] = options;
    }

    /**
     Returns the NumberFormat options for the specified key, or null if the
     key is not found
     @method getNumberFormat
     @param {String} key
     @return {Object|null}
     */
    function getNumberFormat (key) {
        return _numberFormats[key] || null;
    }

    /**
     Central location for helper methods to get a locale to use. Arguments are
     looped through to search for locale itmes. After all parameters have been
     exhausted, it defaults to the global `this` for a locale.
     @protected
     @method _getLocale
     @param {Object} [hash] `options.hash` from the helper
     @param {Object} [ctx] Context of the helper
     @return Locale
     */
    function _getLocale (hash, ctx) {
        /*jshint expr:true */
        hash || (hash = {});
        /*jshint expr:true */
        ctx  || (ctx  = {});

        return hash.locale || ctx.locale || defaults.locale;
    }

    /**
     Creates a new context for the given code. This allows you to define new
     values on the context for things like `locale` and `currency`
     @method intlBlock
     @para {Object} options Options passed to the method from the handlebars handler
     @return {String}
     */
    function intlBlock (options) {
        var context = {},
            hash = options.hash || {},
            p;

        /* jshint proto:true */
        context.__proto__ = this;

        if (hash.locale) {
            context.locale = hash.locale;
        }

        if (hash.currency) {
            context.currency = hash.currency;
        }

        return options.fn(context);
    }

    /**
    Performs a string replacement with provided token, CONTEXT_KEY context, and YRB
    formatted objects
    @method intlMessage
    @param {String} str String on which to perform replacements
    @param {Object} options Options passed to the method from the handlebars handler
    @return {String} Manipulated string that has had tokens replaced
    */
    function intlMessage (str, options) {
        if (!options) {
            throw new ReferenceError('A string must be provided.');
        }

        var hash = (options && options.hash) || {},
            formatOptions = extend({}, hash),
            locale = _getLocale(hash, this),
            msg;

        if (!formatOptions.currency) {
            formatOptions.currency = this.currency;
        }



        msg = new IntlMessageFormat(str, locale, formatOptions);

        return msg.format(formatOptions);
    }


    /**
    Formats the provided number based on the options. Options may specify if the
    returned value should be a delineated number, currency value, or a percentage.
    @method intlNumber
    @param {Number} num Number to format
    @param {Object} options Options passed to the method from the handlebars handler
    @return {String} Formatted number
    */
    function intlNumber (num, options) {
        if (!options) {
            throw new ReferenceError('A number must be provided.');
        }

        var hash = (options && options.hash) || {},
            formatOptions = hash.format && _numberFormats[hash.format] || hash,
            locale = _getLocale(hash, this),
            _num;

        _num = new Intl.NumberFormat(locale, formatOptions);

        num = _num.format(num);

        return num;
    }


    /**
    Formats the provided date or time stamp to the current locale
    @param {Date|Number} stamp Date Object or time stamp to be formatted
    @param {Object} options Options passed to the method from the handlebars handler
    @return {String} Formatted date
    */
    function intlDate (stamp, options) {
        if (!options) {
            throw new ReferenceError('A date or time stamp must be provided.');
        }

        var hash = (options && options.hash) || {},
            formatOptions = hash.format && _dateTimeFormats[hash.format] || hash,
            locale = _getLocale(hash, this),
            _date;

        stamp = new Date(stamp).getTime();

        _date = new Intl.DateTimeFormat(locale, formatOptions);

        return _date.format(stamp);
    }


    /**
    Passes through to other intl methods to format number, format dates, create
    new context blocks, or format messages.
    @method intl
    @param {Number|Date|String} val Value to be formatted or applied
    @param {Object} options Options passed to the method from the handlebars handler
    @return {String|null} Returns the formated or translated value.
    */
    function intl (val, options) {
        if (!options) {
            options = val;
            val = null;
        }

        var token,
            _val,
            len,
            i;

        // pass off to BLOCK
        if (options.fn) {
            return intlBlock.call(this, options);
        }

        // only use token if val is not defined
        if (!val) {
            if (options.hash.token) {
                token = options.hash.token;

                token = token.split('.');
                _val = this;

                for (i = 0, len = token.length; i < len; i++) {
                    if (_val.hasOwnProperty(token[i])) {
                        _val = _val[token[i]];
                    } else {
                        throw new ReferenceError('Could not find path ' + token + ' in ' + _val + ' at ' + token[i]);
                    }
                }

                val = _val;

            } else {
                throw new SyntaxError('A value or a token must be provided.');
            }
        }

        if (typeof val === 'number') {
            // pass off to NUMBER
            val = intlNumber.call(this, val, options);
        } else if (val instanceof Date) {
            // pass off to DATE
            val = intlDate.call(this, val, options);
        } else {
            // pass off to MESSAGE
            val = intlMessage.call(this, val, options);
        }

        return val;
    }


    return {
        // expose the helpers individually in case someone wants to use
        // only some of them
        helpers: {
            intlMessage  : intlMessage,
            intlNumber   : intlNumber,
            intlDate     : intlDate,
            intl         : intl
        },

        // utility method to register all the helpers
        register: function(engine) {
            engine.registerHelper('intlMessage', intlMessage);
            engine.registerHelper('intlNumber', intlNumber);
            engine.registerHelper('intlDate', intlDate);
            engine.registerHelper('intl', intl);
        },

        // utility method to register default values
        registerDefault: function (key/*obj*/, val) {
            if (!val && typeof key === 'object') {
                defaults = key;
            } else {
                defaults[key] = val;
            }
        },

        // expose format methods
        setDateTimeFormat : setDateTimeFormat,
        getDateTimeFormat : getDateTimeFormat,
        setNumberFormat   : setNumberFormat,
        getNumberFormat   : getNumberFormat

    };
});
