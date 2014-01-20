(function (root, factory) {
    var lib = factory();
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
})(typeof global !== 'undefined' ? global : this, function () {

    if (!this.Intl) {
        console.log('no intl');
    }

    var CONTEXT_KEY = 'i18n',
        _dateTimeFormats = {},
        _numberFormats = {};

    function setDateTimeFormat (key, options) {
        _dateTimeFormats[key] = options;
    }

    function getDateTimeFormat (key) {
        return _dateTimeFormats[key] || null;
    }

    function setNumberFormat (key, options) {
        _numberFormats[key] = options;
    }

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

        return hash.locale || ctx.locale || this.locale;
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
            hash = options.hash || {};

        context.prototype = this;

        if (hash.locale) {
            context.locale = hash.locale;
        }

        if (hash.currency) {
            context.currency = hash.locale;
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
            locale = _getLocale(hash, this),
            msg,

        if (!hash.currency) {
            hash.currency = this.currency;
        }

        msg = new IntlMessageFormat(str, locale, hash);

        return msg.format(hash);
        }
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
            throw new ReferenceError('A number must be provided');
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
    new context blocks, format messages, or provide ability to set a value in the
    current CONTEXT_KEY value in the current context.
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
            return intlBlock(options);
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
        }
    };
});
