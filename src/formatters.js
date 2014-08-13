/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jshint esnext: true */

export {getFormatter};

// Cache to hold NumberFormat and DateTimeFormat instances for reuse.
var formatters = {
    number: {},
    date  : {}
};

function getFormatter(type, locales, options) {
    var orderedOptions, option, key, i, len, id, formatter;

    // When JSON is available in the environment, use it build a cache-id to
    // reuse formatters for increased performance.
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

    // Check for a cached formatter instance, and use it.
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
