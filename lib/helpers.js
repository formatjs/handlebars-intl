/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

(function (root, factory) {
    'use strict';

    // Intl and IntlMessageFormat are dependencies of this package. The built-in
    // `Intl` is preferred, but when not available it looks for the polyfill.
    var Intl = root.Intl || root.IntlPolyfill,
        lib  = factory(root.JSON, Intl, root.IntlMessageFormat);

    /* istanbul ignore next */

    if (typeof define === 'function' && define.amd) {
        define(lib);
    }

    if (typeof exports === 'object') {
        module.exports = lib;
    }

    root.HandlebarsHelperIntl = lib;

})(typeof global !== 'undefined' ? global : this, function (JSON, Intl, IntlMessageFormat) {
    'use strict';

    if (!Intl) {
        throw new ReferenceError('Intl must be available.');
    }

    if (!IntlMessageFormat) {
        throw new ReferenceError('IntlMessageFormat must be available.');
    }

    var exports = {};

    // Export the helpers.
    exports.helpers = {
        intl       : intl,
        intlDate   : intlDate,
        intlNumber : intlNumber,
        intlGet    : intlGet,
        intlMessage: intlMessage
    };

    // Export utility function to register all the helpers.
    exports.registerWith = function (engine) {
        var helpers = exports.helpers,
            name;

        for (name in helpers) {
            if (helpers.hasOwnProperty(name)) {
                engine.registerHelper(name, helpers[name]);
            }
        }
    };

    // -- Internals ------------------------------------------------------------

    // Cache to hold NumberFormat and DateTimeFormat instances for reuse.
    var formats = {
        number: {},
        date  : {}
    };

    function getFormat(type, locales, options) {
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
        format = formats[type][id];
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
            formats[type][id] = format;
        }

        return format;
    }

    // -- Helpers --------------------------------------------------------------

    function intl(options) {
        /* jshint validthis:true */

        if (!options.fn) {
            throw new ReferenceError('intl must be invoked as a block helper');
        }

        var hash = options.hash,
            data = options.data;

        // Assign the `hash` values to `data.intl` to pass them to everything
        // within the {{#intl}} block.
        return options.fn(this, {
            data: extend({}, data, {
                intl: extend({}, data.intl, hash)
            })
        });
    }

    function intlDate(date, options) {
        date = new Date(date);

        // Determine if the `date` is valid.
        if (!(date && date.getTime())) {
            throw new TypeError('A date must be provided.');
        }

        var hash    = options.hash,
            data    = options.data,
            locales = data.intl && data.intl.locales;

        return getFormat('date', locales, hash).format(date);
    }

    function intlNumber(num, options) {
        if (typeof num !== 'number') {
            throw new TypeError('A number must be provided.');
        }

        var hash    = options.hash,
            data    = options.data,
            locales = data.intl && data.intl.locales;

        return getFormat('number', locales, hash).format(num);
    }

    function intlGet(path, options) {
        var data      = options.data,
            messages  = data.intl && data.intl.messages,
            pathParts = path.split('.'),
            message, len, i;

        // Use the path to walk the Intl messages to find the message, and throw
        // a descriptive error the message is not found.
        try {
            for (i = 0, len = pathParts.length; i < len; i++) {
                message = messages = messages[pathParts[i]];
            }
        } finally {
            if (message === undefined) {
                throw new ReferenceError('Could not find Intl message: ' + path);
            }
        }

        return message;
    }

    function intlMessage(message, options) {
        if (!options) {
            options = message;
            message = null;
        }

        var hash = options.hash;

        // Support a message being passed as a string argument or pre-prased
        // array. When there's no `message` argument, ensure a message path name
        // was provided at `intlName` in the `hash`.
        //
        // TODO: remove support form `hash.intlName` once Handlebars bugs with
        // subexpressions are fixed.
        if (!(message || typeof message === 'string' || hash.intlName)) {
            throw new ReferenceError('A message or intlName must be provided');
        }

        var intlData = (options.data && options.data.intl) || {},
            locales  = intlData.locales,
            formats  = intlData.formats;

        // Lookup message by path name.
        if (!message && hash.intlName) {
            message = intlGet(hash.intlName, options);
        }

        // Assume that an object with a `format()` method is already an
        // IntlMessageFormat instance, and use it; otherwise create a new one.
        var messageFormat = typeof message.format === 'function' ? message :
                new IntlMessageFormat(message, locales, formats);

        return messageFormat.format(hash);
    }

    // -- Utilities ------------------------------------------------------------

    function extend(obj) {
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

    return exports;
});
