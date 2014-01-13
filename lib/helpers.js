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

    if (!Intl) {
        console.log('no intl');
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
        hash || (hash = {});
        ctx  || (ctx  = {});

        return hash.locale || ctx.locale || this.locale;
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
            msg = new IntlMessageFormat(str, locale);

        return msg.format(hash);
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
            locale = _getLocale(hash, this),
            _num;

        _num = new Intl.NumberFormat(locale, hash);

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
            formatOptions = hash,
            locale = _getLocale(hash, this),
            _date;

        if (hash.format) {
            switch (hash.format) {
                case 'd': //'6/15/2009',
                    formatOptions = {};
                    break;
                case 'D': //'Monday, June 15, 2009',
                    formatOptions = {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    };
                    break;
                case 'f': //'Monday, June 15, 2009 1:45 PM ',
                    formatOptions = {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric'
                    };
                    break;
                case 'F': //'Monday, June 15, 2009 1:45:30 PM',
                    formatOptions = {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric'
                    };
                    break;
                case 'g': //'6/15/2009 1:45 PM',
                    formatOptions = {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: 'numeric',
                        minute: 'numeric'
                    };
                    break;
                case 'G': //'6/15/2009 1:45:30 PM',
                    formatOptions = {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric'
                    };
                    break;
                case 'm': //'June 15',
                case 'M': //'June 15',
                    formatOptions = {
                        month: "long",
                        day: "numeric"
                    };
                    break;
                case 'o': //'2009-06-15T13:45:30.0900000',
                    formatOptions = {};
                    break;
                case 'O': //'2009-06-15T13:45:30.0900000',
                    formatOptions = {};
                    break;
                case 'r': //'Mon, 15 Jun 2009 20:45:30 GMT',
                case 'R': //'Mon, 15 Jun 2009 20:45:30 GMT',
                    formatOptions = {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                        timeZone: "UTC",
                        timeZoneName: 'long',
                        hour12: false
                    };
                    break;
                case 's': //'2009-06-15T13:45:30',
                    formatOptions = {};
                    break;
                case 't': //'1:45 PM',
                    formatOptions = {
                        hour: 'numeric',
                        minute: 'numeric'
                    };
                    break;
                case 'T': //'1:45:30 PM',
                    formatOptions = {
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric'
                    };
                    break;
                case 'u': //'2009-06-15 20:45:30Z',
                    formatOptions = {};
                    break;
                case 'U': //'Monday, June 15, 2009 8:45:30 PM',
                    formatOptions = {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric'
                    };
                    break;
                case 'y': //'June, 2009'
                    formatOptions = {
                        month: 'long',
                        year: 'numeric'
                    };
                    break;

            }
        }

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
            i,
            context;

        // pass off to BLOCK
        if (options.fn) {
            context = {};
            context.prototype = this;

            if (options.hash && options.hash.locale) {
                context.locale = options.hash.locale
            }

            return options.fn(context);
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
