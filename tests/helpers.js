/*
 * Copyright (c) 2011-2013, Yahoo! Inc. All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

/* jshint node:true */
/* global describe, it, locale */

'use strict';

// set locale
global.locale = "en";

var chai,
    expect,
    Handlebars,
    intl,
    intlMsg;

if (typeof require === 'function') {
    chai = require('chai');
    Handlebars = require('handlebars');

    intl = require('intl');
    intlMsg = require('intl-messageformat');

    require('../lib/helpers.js').register(Handlebars);
}
expect = chai.expect;

/* jshint expr:true */
global.Intl || (global.Intl = intl);

describe('helpers with number formats', function () {

    it('Simple Number', function () {
        var tmpl = "{{intl 4}}",
            out;

        out = Handlebars.compile(tmpl)();

        expect(out).to.equal("4");
    });

    it('Simple Number - Decimal', function () {
        var tmpl = '{{intl NUM}}',
            out;

        out = Handlebars.compile(tmpl)({
            NUM: 4.004
        });

        expect(out).to.equal("4.004");
    });

    it('Currency', function () {
        var tmpl = '{{intl 4 style="currency" currency="USD"}}',
            out;

        out = Handlebars.compile(tmpl)();

        expect(out).to.equal("$4.00");
    });

    it('Currency - EUR', function () {
        var tmpl = '{{intl 4 style="currency" currency="EUR"}}',
            out;

        out = Handlebars.compile(tmpl)();

        expect(out).to.equal("€4.00");
    });

    it('Currency - EUR with code', function () {
        var tmpl = '{{intl 4 style="currency" currency="EUR" currencyDisplay="code"}}',
            out;

        out = Handlebars.compile(tmpl)();

        expect(out).to.equal("EUR4.00");
    });

    it('Percent', function () {
        var tmpl = '{{intl 4 style="percent"}}',
            out;

        out = Handlebars.compile(tmpl)();

        expect(out).to.equal("400%");
    });

    it('Percent - decimal value', function () {
        var tmpl = '{{intlNumber "0.04" style="percent"}}',
            out;

        out = Handlebars.compile(tmpl)();

        expect(out).to.equal("4%");
    });

});

