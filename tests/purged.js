/*
 * Copyright (c) 2011-2013, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

/*jshint node:true */
/*global describe, it, before */

'use strict';

// set locale
global.locale = "en";
global.currency = "USD";

var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,

    mockery = require('mockery'),

    Handlebars = require('handlebars'),
    IntlMessageFormat,


    Helpers,
    intl;


mockery.enable({
    useCleanCache:      true,
    warnOnReplace:      false,
    warnOnUnregistered: false
});

describe('Helpers', function () {

    before(function () {
        mockery.resetCache();
        global.Intl = null;
        global.IntlMessageFormat = null;
    });

    it('should throw when intl and intl-messageformat are not loaded', function () {
        assert.throw(function () {
            Helpers = require('../lib/helpers.js');
        }, ReferenceError, 'Intl must be provided.');
    });

    it('shold throw when intl is loaded but not intl-messageformat', function () {
        intl = require('intl');

        if (typeof global.Intl === 'undefined' || !global.Intl) {
            global.Intl = intl;
        }

        assert.throw(function () {
            Helpers = require('../lib/helpers.js');
        }, ReferenceError, 'IntlMessageFormat must be provided.');
    });

    it('should not throw if intl and intl-messageformat are loaded', function () {
        intl = require('intl');

        if (typeof Intl === 'undefined') {
            global.Intl = intl;
        }

        // load in message format
        IntlMessageFormat = require('intl-messageformat');
        require('intl-messageformat/locale-data/en');

        Helpers = require('../lib/helpers.js');
        Helpers.register(Handlebars);
    });

});

