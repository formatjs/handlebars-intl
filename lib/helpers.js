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

    // Export utility function to register all the helpers.
    exports.registerWith = function (Handlebars) {
        var SafeString  = Handlebars.SafeString,
            createFrame = Handlebars.createFrame,
            escape      = Handlebars.Utils.escapeExpression,
            extend      = Handlebars.Utils.extend;

        var helpers = {
            intl       : intl,
            intlDate   : intlDate,
            intlNumber : intlNumber,
            intlGet    : intlGet,
            intlMessage: intlMessage
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

            // Create a new data frame linked the parent.
            var data     = createFrame(options.data),
                intlData = {};

            // Create a new intl data object and extend it with
            // `options.data.intl` and `options.hash`.
            extend(intlData, data.intl);
            extend(intlData, options.hash);
            data.intl = intlData;

            return options.fn(this, {data: data});
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
                message = new IntlMessageFormat(message, locales, formats);
            }

            return message.format(hash);
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

    return exports;
});
