/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jshint esnext: true */

import {getFormatter} from './formatters';
import {extend} from './utils';

export {registerWith};

// -----------------------------------------------------------------------------

function registerWith(Handlebars) {
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
    };

    for (var name in helpers) {
        if (helpers.hasOwnProperty(name)) {
            Handlebars.registerHelper(name, helpers[name]);
        }
    }

    // -- Helpers --------------------------------------------------------------

    function intl(options) {
        /* jshint validthis:true */

        if (!options.fn) {
            throw new ReferenceError('{{#intl}} must be invoked as a block helper');
        }

        // Create a new data frame linked the parent and create a new intl data
        // object and extend it with `options.data.intl` and `options.hash`.
        var data     = createFrame(options.data),
            intlData = extend({}, data.intl, options.hash);

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

            formatOptions = extend({}, formatOptions, hash);
        } else {
            formatOptions = hash;
        }

        return getFormatter('date', locales, formatOptions).format(date);
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

            formatOptions = extend({}, formatOptions, hash);
        } else {
            formatOptions = hash;
        }

        return getFormatter('number', locales, formatOptions).format(num);
    }

    function intlGet(path, options) {
        var intlData  = options.data && options.data.intl,
            pathParts = path.split('.');

        var obj, len, i;

        // Use the path to walk the Intl data to find the object at the given
        // path, and throw a descriptive error if it's not found.
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

        // TODO: remove support form `hash.intlName` once Handlebars bugs with
        // subexpressions are fixed.
        if (!(message || hash.intlName)) {
            throw new ReferenceError('{{intlMessage}} must be provided a message or intlName');
        }

        // Lookup message by path name. The caller must supply the full path to
        // the  message on `options.data.intl`.
        if (!message && hash.intlName) {
            message = intlGet(hash.intlName, options);
        }

        // When `message` is a function, assume it's an IntlMessageFormat
        // instance's `format()` method passed by reference, and call it. This
        // is possible because its `this` will be pre-bound to the instance.
        if (typeof message === 'function') {
            return message(hash);
        }

        // Assume that an object with a `format()` method is an
        // IntlMessageFormat instance, otherwise throw.
        if (typeof message.format !== 'function') {
            throw new ReferenceError('{{intlMessage}} must be provided an IntlMessageFormat instance');
        }

        return message.format(hash);
    }

    function intlHTMLMessage() {
        /* jshint validthis:true */
        var options = [].slice.call(arguments).pop(),
            hash    = options.hash;

        var key, value;

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

        // Return a Handlebars `SafeString`. This first unwraps the result to
        // make sure it's not returning a double-wrapped `SafeString`.
        return new SafeString(String(intlMessage.apply(this, arguments)));
    }
}
