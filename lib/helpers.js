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

    var Intl = Intl || IntlPolyfill;

    if (!Intl) {
        console.log('no intl');
    }

    var CONTEXT_KEY = 'i18n';

    /**
     Deeply clones the sender to the receiver to prevent any contamination of the
     original object
     @protected
     @method mix
     @param {Object} receiver
     @param {Object} sender
     */
    function _mix (receiver, sender) {
        var p,
            val,
            valType;

        for (p in sender) {
            if (sender.hasOwnProperty(p)) {
                val = sender[p];
                valType = Object.prototype.toString.call(val);

                if (valType === '[object Object]') {
                    receiver[p] = {};
                    arguments.callee(receiver[p], val);
                } else if (valType === '[object Array]') {
                    receiver[p] = [];
                    arguments.callee(receiver[p], val);
                } else {
                    receiver[p] = sender[p];
                }
            }
        }

        return receiver;
    }

    /**
     Central location for helper methods to get a locale to use. Arguments are
     looped through to search for locale itmes. After all parameters have been
     exhausted, it defaults to the global `this` for a locale.
     @protected
     @method _getLocale
     @return Locale
     */
    function _getLocale (/*options.hash, ctx*/) {
        var args = Array.prototype.slice.call(arguments),
            locale = this.locale,
            i, len;

        for (i = 0, len = args.length; i < len; i++) {
            if (args[i].hasOwnProperty('locale')) {
                return args[i].locale;
            }
        }

        return locale;
    }


    /**
    Creates a new context for the given code. This allows you to define variables
    by setting them as options, change the locale (future only), etc.
    @method intlBlock
    @param {Objec} options Options passed to the method from the handlebars handler
    @return
    */
    function intlBlock (options) {
        var hash = (options && options.hash) || {},
            locale = _getLocale(hash, this),
            context,
            k;

        context = _mix({}, this);

        if (!context[CONTEXT_KEY]) {
            context[CONTEXT_KEY] = {};
        }

        for (k in hash) {
            if (hash.hasOwnProperty(k)) {
                // Store locale in the context
                if (k === 'locale') {
                    context.locale = hash.locale;
                }

                context[CONTEXT_KEY][k] = hash[k];
            }
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
            intlBlock    : intlBlock,
            intlMessage  : intlMessage,
            intlNumber   : intlNumber,
            intlDate     : intlDate,
            intl         : intl
        },

        // utility method to register all the helpers
        register: function(engine) {
            engine.registerHelper('intlBlock', intlBlock);
            engine.registerHelper('intlMessage', intlMessage);
            engine.registerHelper('intlNumber', intlNumber);
            engine.registerHelper('intlDate', intlDate);
            engine.registerHelper('intl', intl);
        }
    };
});
