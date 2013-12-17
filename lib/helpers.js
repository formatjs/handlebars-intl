/**
 Creates a new context for the given code. This allows you to define variables
 by setting them as options, change the locale (future only), etc.
 @method intlBlock
 @param {Objec} options Options passed to the method from the handlebars handler
 @return
 */
function intlBlock (options) {
    var hash = (options && options.hash) || {},
        locale = _getLocale(options),
        context,
        k;

    context = _mix({}, this);

    if (!context[CONTEXT_KEY]) {
        context[CONTEXT_KEY] = {};
    }

    for (k in hash) {
        if (hash.hasOwnProperty(k)) {
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
        throw 'A string must be provided.';
    }

    var hash = (options && options.hash) || {},
        locale = _getLocale(options),
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
        throw 'A number must be provided';
    }

    var hash = (options && options.hash) || {},
        locale = _getLocale(options),
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
        throw 'A date or time stamp must be provided.';
    }

    var hash = (options && options.hash) || {},
        formatOptions = hash,
        locale = _getLocale(options),
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
                    throw 'Could not find path ' + token + ' in ' + _val + ' at ' + token[i];
                }
            }

            val = _val;

        } else {
            throw 'A value or a token must be provided.';
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

// If we are requiring this add it to the module's exports
if (modules && modules.export) {
    modules.export.intlBlock   = intlBlock;
    modules.export.intlMessage = intlMessage;
    modules.export.intlNumber  = intlNumber;
    modules.export.intlDate    = intlDate;
    modules.export.intl        = intl;
}

