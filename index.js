var helpers = require('./lib/helpers.js');

/**
 Gets helpers in the provided location?
 */
modules.export.getHelpers = function (location) {
    if (location === 'Intl') {
        return helpers;
    } else {
        return {};
    }
};

/**
 Registers the helper on the provided handlebars engine
 @method registerHelpers
 @param {Object} engine
 */
modules.expoert.registerHelpers = function (engine) {
    var p;

    for (p in helpers) {
        if (helpers.hasOwnProperty(p)) {
            engine.registerHelper(p, helpers[p]);
        }
    }
};
