var helpers = require('./lib/helpers.js');

<<<<<<< HEAD
=======
console.log(helpers);

>>>>>>> format

/**
 Gets helpers in the provided location?
 */
module.exports.getHelpers = function (location) {
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
module.exports.registerHelpers = function (engine) {
    helpers.register(engine);
};
