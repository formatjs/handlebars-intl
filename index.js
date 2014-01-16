var helpers = require('./lib/helpers.js');

/**
 Gets helpers in the provided location?
 */
module.exports.getHelpers = function (location) {
    return helpers.helpers;
};

/**
 Registers the helper on the provided handlebars engine
 @method registerHelpers
 @param {Object} engine
 */
module.exports.registerHelpers = function (engine) {
    helpers.register(engine);
};
