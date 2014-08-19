'use strict';

global.Intl || require('intl');

var Handlebars     = require('handlebars'),
    hbsIntlHelpers = require('../../');

hbsIntlHelpers.registerWith(Handlebars);

var formatNumber = Handlebars.helpers.formatNumber;

module.exports = function () {
    formatNumber(4000, {
        data: {},
        hash: {}
    });
};
