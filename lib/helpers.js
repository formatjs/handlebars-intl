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
    exports.register = function (engine) {
        var helpers = exports.helpers,
            name;

        for (name in helpers) {
            if (helpers.hasOwnProperty(name)) {
                engine.registerHelper(name, helpers[name]);
            }
        }
    };

    // Cache to hold NumberFormat and DateTimeFormat instances for reuse.
    var formatters = {
        number: {},
        date  : {}
    };

    function getFormatter(type, locales, options) {
        var orderedOptions, option, key, i, len, id, formatter;

        // When JSON is available in the environment, use it build a cache-id
        // to reuse formatters for increased performance.
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

        // Check for cached formatter, and use it.
        formatter = formatters[type][id];
        if (formatter) { return formatter; }

        switch (type) {
            case 'number':
                formatter = new Intl.NumberFormat(locales, options);
                break;
            case 'date':
                formatter = new Intl.DateTimeFormat(locales, options);
                break;
        }

        // Cache formatter for reuse.
        if (id) {
            formatters[type][id] = formatter;
        }

        return formatter;
    }

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

    function intlDate (date, options) {
        date = new Date(date);

        // Determine if the `date` is valid.
        if (!(date && date.getTime())) {
            throw new TypeError('A date must be provided.');
        }

        var hash    = options.hash,
            data    = options.data,
            locales = data.intl && data.intl.locales;

        return getFormatter('date', locales, hash).format(date);
    }

    function intlNumber (num, options) {
        if (typeof num !== 'number') {
            throw new TypeError('A number must be provided.');
        }

        var hash    = options.hash,
            data    = options.data,
            locales = data.intl && data.intl.locales;

        return getFormatter('number', locales, hash).format(num);
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

        // Look for a cached formatter on the message.
        var formatter = message.__formatter__;

        if (!formatter) {
            formatter = new IntlMessageFormat(message, locales, formats);

            // Cache formatter on message. String values don't support expand-o
            // properties, therefore the formatter cannot be cached on them.
            if (typeof message !== 'string') {
                message.__formatter__ = formatter;
            }
        }

        return formatter.format(hash);
    }

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
