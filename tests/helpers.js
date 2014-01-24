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

    if (typeof Intl === 'undefined') {
        global.Intl = intl;
    }

    // load in message format
    require('intl-messageformat');
    require('intl-messageformat/locale-data/en');

    require('../lib/helpers.js').register(Handlebars);
}

expect = chai.expect;


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

    describe('msg formatting', function () {
        it('should should make dollahs', function () {
            var tmpl = '{{intl MSG amount=AMOUNT}}',
                out;

            out = Handlebars.compile(tmpl)({
                MSG: "I have {amount, number, currency} in my account.",
                AMOUNT: 23456
            });

            expect(out).to.equal('I have $23,456.00 in my account.');
        });
        it('should should make euros', function () {
            var tmpl = '{{intl MSG amount=AMOUNT currency="EUR"}}',
                out;

            out = Handlebars.compile(tmpl)({
                MSG: "I have {amount, number, currency} in my account.",
                AMOUNT: 23456
            });

            expect(out).to.equal('I have €23,456.00 in my account.');
        });
        it('should should make euros within a block', function () {
            var tmpl = '{{#intl currency="EUR"}}{{intl MSG amount=AMOUNT}}{{/intl}}',
                out;

            out = Handlebars.compile(tmpl)({
                MSG: "I have {amount, number, currency} in my account.",
                AMOUNT: 23456
            });

            expect(out).to.equal('I have €23,456.00 in my account.');

            out = Handlebars.compile(tmpl)({
                MSG: "You have {amount, number, currency} in my account.",
                AMOUNT: 11111
            });

            expect(out).to.equal('You have €11,111.00 in my account.');
        });
        it('should should make yen within a deep block', function () {
            var tmpl = '{{#intl currency="EUR"}}{{#intl currency="JPY"}}{{intl MSG amount=AMOUNT}}{{/intl}}{{/intl}}',
                out;

            out = Handlebars.compile(tmpl)({
                MSG: "I have {amount, number, currency} in my account.",
                AMOUNT: 23456
            });

            expect(out).to.equal('I have ¥23,456 in my account.');

            out = Handlebars.compile(tmpl)({
                MSG: "You have {amount, number, currency} in my account.",
                AMOUNT: 11111
            });

            expect(out).to.equal('You have ¥11,111 in my account.');
        });
        it('should work with each statements', function () {
            var tmpl = '{{#intl currency="EUR"}}' +
                        '{{#each messages}}{{intl msg firstName=../firstName lastName=../lastName amount=amount}}{{/each}}' +
                        '{{/intl}}';

            var out = Handlebars.compile(tmpl)({
                firstName: 'Anthony',
                lastName: 'Pipkin',
                messages: [
                    {
                        msg: "{firstName} {lastName} has {amount, number, integer} {amount, plural, one {book} other {books}}.",
                        amount: 234567
                    },
                    {
                        msg: "{firstName} {lastName} has {amount, number, currency}.",
                        amount: 234567
                    }
                ]
            });

            expect(out).to.equal('Anthony Pipkin has 234,567 books.Anthony Pipkin has $234,567.00.');
        });
    });

});

