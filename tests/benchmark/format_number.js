'use strict';

global.Intl || require('intl');

var Handlebars     = require('handlebars'),
    hbsIntlHelpers = require('../../');

hbsIntlHelpers.registerWith(Handlebars);

var intlNumber = Handlebars.helpers.intlNumber;

module.exports = function () {
    intlNumber(4000, {
        data: {},
        hash: {}
    });
};
