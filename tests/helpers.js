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
global.currency = "USD";

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
    require('intl-messageformat/locale-data/en');

    require('../lib/helpers.js').register(Handlebars);
}
expect = chai.expect;

/* jshint expr:true */
global.Intl || (global.Intl = intl);

describe('Helper `intlNumber`', function () {

    it('should be added to Handlebars', function () {
        expect(Handlebars.helpers).to.include.keys('intlNumber');
    });

    it('should be a function', function () {
        expect(Handlebars.helpers.intlNumber).to.be.a('function');
    });

    it('should throw if called with out a value', function () {
        try {
            Handlebars.compile('{{intlNumber}}')();
        } catch (e) {
            var err = new ReferenceError('A number must be provided.');
            expect(e.toString()).to.equal(err.toString());
        }
    });

    describe('used to format numbers', function () {
        it('should return a string', function () {
            var tmpl = "{{intlNumber 4}}",
                out;

            out = Handlebars.compile(tmpl)();

            expect(out).to.equal("4");
        });

        it('should return a decimal as a string', function () {
            var tmpl = Handlebars.compile('{{intlNumber NUM}}'),
                out = tmpl({ NUM: 4.004 });

            expect(out).to.equal("4.004");
        });

        it('should return a formatted string with a thousand separator', function () {
            var tmp = Handlebars.compile('{{intlNumber NUM}}'),
                out = tmp({ NUM: 40000 });

            expect(out).to.equal('40,000');
        });

        it('should return a formatted string with a thousand separator and decimal', function () {
            var tmp = Handlebars.compile('{{intlNumber NUM}}'),
                out = tmp({ NUM: 40000.004 });

            expect(out).to.equal('40,000.004');
        });

        describe('in another locale', function () {
            it('should return a string', function () {
                var tmpl = '{{intlNumber 4 locale="de-DE"}}',
                    out;

                out = Handlebars.compile(tmpl)();

                expect(out).to.equal("4");
            });

            it('should return a decimal as a string', function () {
                var tmpl = Handlebars.compile('{{intlNumber NUM locale="de-DE"}}'),
                    out = tmpl({ NUM: 4.004 });

                expect(out).to.equal("4,004");
            });

            it('should return a formatted string with a thousand separator', function () {
                var tmp = Handlebars.compile('{{intlNumber NUM locale="de-DE"}}'),
                    out = tmp({ NUM: 40000 });

                expect(out).to.equal('40.000');
            });

            it('should return a formatted string with a thousand separator and decimal', function () {
                var tmp = Handlebars.compile('{{intlNumber NUM locale="de-DE"}}'),
                    out = tmp({ NUM: 40000.004 });

                expect(out).to.equal('40.000,004');
            });
        });

    });

    describe('used to format currency', function () {
        it('should return a string formatted to currency', function () {
            var tmp = Handlebars.compile('{{intlNumber 40000 style="currency" currency=CURRENCY}}'),
                out = tmp({ CURRENCY: 'USD' });

            expect(out, 'USD').to.equal('$40,000.00');

            tmp = Handlebars.compile('{{intlNumber 40000 style="currency" currency=CURRENCY}}');
            out = tmp({ CURRENCY: 'EUR'});
            expect(out, 'EUR').to.equal('€40,000.00');

            tmp = Handlebars.compile('{{intlNumber 40000 style="currency" currency=CURRENCY}}');
            out = tmp({ CURRENCY: 'JPY'});
            expect(out, 'JPY').to.equal('¥40,000');
        });

        it('should return a string formatted to currency with code', function () {
            var tmp = Handlebars.compile('{{intlNumber 40000 style="currency" currency=CURRENCY currencyDisplay="code"}}'),
                out = tmp({ CURRENCY: 'USD' });

            expect(out, 'USD').to.equal('USD40,000.00');

            tmp = Handlebars.compile('{{intlNumber 40000 style="currency" currency=CURRENCY currencyDisplay="code"}}');
            out = tmp({ CURRENCY: 'EUR'});
            expect(out, 'EUR').to.equal('EUR40,000.00');

            tmp = Handlebars.compile('{{intlNumber 40000 style="currency" currency=CURRENCY currencyDisplay="code"}}');
            out = tmp({ CURRENCY: 'JPY'});
            expect(out, 'JPY').to.equal('JPY40,000');
        });

        it('should function within an `each` block helper', function () {
            var tmp = Handlebars.compile('{{#each currencies}} {{intlNumber AMOUNT style="currency" currency=CURRENCY}}{{/each}}'),
                out = tmp({ currencies: [
                        { AMOUNT: 3, CURRENCY: 'USD'},
                        { AMOUNT: 8, CURRENCY: 'EUR'},
                        { AMOUNT: 10, CURRENCY: 'JPY'}
                    ]});

            // note the output must contain the correct spaces to match the template
            expect(out).to.equal(' $3.00 €8.00 ¥10');
        });

        it('should return a currency even when using a different locale', function (){
            var tmp = Handlebars.compile('{{intlNumber 40000 locale="de-DE" style="currency" currency=CURRENCY}}'),
                out = tmp({ CURRENCY: 'USD' });

            expect(out, 'USD->de-DE').to.equal('40.000,00 $');

            tmp = Handlebars.compile('{{intlNumber 40000 locale="de-DE" style="currency" currency=CURRENCY}}');
            out = tmp({ CURRENCY: 'EUR'});
            expect(out, 'EUR->de-DE').to.equal('40.000,00 €');

            tmp = Handlebars.compile('{{intlNumber 40000 locale="de-DE" style="currency" currency=CURRENCY}}');
            out = tmp({ CURRENCY: 'JPY'});
            expect(out, 'JPY->de-DE').to.equal('40.000 ¥');
        });
    });

    describe('used to format percentages', function () {
        it('should return a string formatted to a percent', function () {
            var tmp = Handlebars.compile('{{intlNumber 400 style="percent"}}');

            expect(tmp()).to.equal('40,000%');
        });

        it('should return a perctage when using a different locale', function () {
            var tmp = Handlebars.compile('{{intlNumber 400 locale="de-DE" style="percent"}}');

            expect(tmp()).to.equal('40.000 %');
        });

    });
});
describe('Helper `intlDate`', function () {

    it('should be added to Handlebars', function () {
        expect(Handlebars.helpers).to.include.keys('intlDate');
    });

    it('should be a function', function () {
        expect(Handlebars.helpers.intlDate).to.be.a('function');
    });

    it('should throw if called with out a value', function () {
        try {
            Handlebars.compile('{{intlDate}}')();
        } catch (e) {
            var err = new ReferenceError('A date or time stamp must be provided.');
            expect(e.toString()).to.equal(err.toString());
        }
    });

    // Use a fixed known date
    var dateStr = 'Thu Jan 23 2014 18:00:44 GMT-0500 (EST)',
        timeStamp = 1390518044403;

    it('should return a formatted string', function () {
        var tmp = Handlebars.compile('{{intlDate "' + dateStr + '"}}');

        expect(tmp()).to.equal('1/23/2014');

        // note timestamp is passed as a number
        tmp = Handlebars.compile('{{intlDate ' + timeStamp + '}}');

        expect(tmp()).to.equal('1/23/2014');
    });

    /** SINGLE VALUES ARE MUTED FOR NOW :: https://github.com/andyearnshaw/Intl.js/issues/56
    it('should return a formatted string of option requested', function () {
        // year
        var tmp = Handlebars.compile('{{intlDate DATE year="numeric"}}'),
            out = tmp({ DATE: dateStr });

        expect(out).to.equal('2014');
    });
    */

    it('should return a formatted string of just the time', function () {
        var tmp = Handlebars.compile('{{intlDate ' + timeStamp + ' hour="numeric" minute="numeric"}}');

        expect(tmp()).to.equal('6:00 PM');
    });

});

describe('Helper `intlMessage`', function () {

    it('should be added to Handlebars', function () {
        expect(Handlebars.helpers).to.include.keys('intlMessage');
    });

    it('should be a function', function () {
        expect(Handlebars.helpers.intlMessage).to.be.a('function');
    });

    it('should throw if called with out a value', function () {
        try {
            Handlebars.compile('{{intlMessage}}')();
        } catch (e) {
            var err = new ReferenceError('A string must be provided.');
            expect(e.toString()).to.equal(err.toString());
        }
    });

    it('should return a formatted string', function () {
        var tmp = Handlebars.compile('{{intlMessage MSG firstName=firstName lastName=lastName}}'),
            out = tmp({
                MSG: 'Hi, my name is {firstName} {lastName}.',
                firstName: 'Anthony',
                lastName: 'Pipkin'
            });

        expect(out).to.equal('Hi, my name is Anthony Pipkin.');
    });

    it('should return a formatted string with formatted numbers and dates', function () {
        var tmp = Handlebars.compile('{{intlMessage POP_MSG city=city population=population census_date=census_date timeZone=timeZone}}'),
            out = tmp({
                POP_MSG: '{city} has a population of {population, number, integer} as of {census_date, date, medium}.',
                city: 'Atlanta',
                population: 5475213,
                census_date: (new Date('1/1/2010')).getTime(),
                timeZone: 'UTC'
            });

        expect(out).to.equal('Atlanta has a population of 5,475,213 as of Jan 1, 2010.');
    });

    it('should return a formatted string with formatted numbers and dates in a different locale', function () {
        var tmp = Handlebars.compile('{{intlMessage POP_MSG locale="de-DE" city=city population=population census_date=census_date timeZone=timeZone}}'),
            out = tmp({
                POP_MSG: '{city} has a population of {population, number, integer} as of {census_date, date, medium}.',
                city: 'Atlanta',
                population: 5475213,
                census_date: (new Date('1/1/2010')),
                timeZone: 'UTC'
            });

        expect(out).to.equal('Atlanta has a population of 5.475.213 as of 1. Jan. 2010.');
    });

    it('should return a formatted string with an `each` block', function () {
        var tmp = Handlebars.compile('{{#each harvest}} {{intlMessage ../HARVEST_MSG person=person count=count }}{{/each}}'),
            out = tmp({
                HARVEST_MSG: '{person} harvested {count, plural, one {# apple} other {# apples}}.',
                harvest: [
                    { person: 'Allison', count: 10 },
                    { person: 'Jeremy', count: 60 }
                ]
            });

        expect(out).to.equal(' Allison harvested 10 apples. Jeremy harvested 60 apples.');
    });

});

describe('Helper `intl`', function () {

    it('should be added to Handlebars', function () {
        expect(Handlebars.helpers).to.include.keys('intl');
    });

    it('should be a function', function () {
        expect(Handlebars.helpers.intl).to.be.a('function');
    });

    it('should pass off to format a number', function () {
        var tmp = Handlebars.compile('{{intl NUM locale="de-DE"}}'),
            out = tmp({ NUM: 40000.004 });

        expect(out).to.equal('40.000,004');
    });

    it('should pass off to format a date', function (){
        var tmp = Handlebars.compile('{{intl date}}'),
            out = tmp({
                    date: new Date('Thu Jan 23 2014 18:00:44 GMT-0500 (EST)')
                });

        expect(out).to.equal('1/23/2014');
    });

    it('should pass off to format a message', function () {
        var tmp = Handlebars.compile('{{#each harvest}} {{intl ../HARVEST_MSG person=person count=count }}{{/each}}'),
            out = tmp({
                HARVEST_MSG: '{person} harvested {count, plural, one {# apple} other {# apples}}.',
                harvest: [
                    { person: 'Allison', count: 10 },
                    { person: 'Jeremy', count: 60 }
                ]
            });

        expect(out).to.equal(' Allison harvested 10 apples. Jeremy harvested 60 apples.');
    });

    describe('as a block helper', function () {
        it('should maintain a locale', function () {
            var str = '{{intl NUM}} {{#intl locale="de-DE"}}{{intl ../NUM}}{{/intl}} {{intl NUM}}',
                tmp = Handlebars.compile(str),
                out = tmp({ NUM: 40000.004});

            expect(out).to.equal('40,000.004 40.000,004 40,000.004');
        });

/** TO COME AFTER PR #10 **
        it('should maintain a currency', function () {
            var str = '{{intl NUM style="currency"}}{{#intl currency="EUR"}}{{intl ../NUM style="currency"}}{{/intl}} {{intl NUM style="currency"}}',
                tmp = Handlebars.compile(str),
                out = tmp({ NUM: 40000.004});

            expect(out).to.equal('40,000.004 40.000,004 40,000.004');
        });

        it('should maintain context regardless of depth', function () {
            var str = '{{#intl locale="de-DE"}}{{#intl locale="en-US"}} {{intl NUM}} {{/intl}}{{intl NUM}}{{/intl}} {{intl NUM}}',
                tmp = Handlebars.compile(str),
                out = tmp({ NUM: 40000.004 });

            expect(out).to.equal('40,000.004 40.000,004 40,000.04');
        });
//*/
    });
});

