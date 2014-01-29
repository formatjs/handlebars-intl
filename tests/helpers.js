/*
 * Copyright (c) 2011-2013, Yahoo! Inc. All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

/* jshint node:true */
/* global describe, it, locale */

'use strict';

var chai,
    expect,
    assert,

    Handlebars,
    intl,
    IntlHelpers,

    defaultData = {
        data : {
            locale   : 'en-US',
            currency : 'USD'
        }
    };

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


    IntlHelpers = require('../lib/helpers.js');
    IntlHelpers.register(Handlebars);
}

expect = chai.expect;
assert = chai.assert;




describe('Helper `intlNumber`', function () {

    it('should be added to Handlebars', function () {
        expect(Handlebars.helpers).to.include.keys('intlNumber');
    });

    it('should be a function', function () {
        expect(Handlebars.helpers.intlNumber).to.be.a('function');
    });

    it('should throw if called with out a value', function () {
        assert.throw(Handlebars.compile('{{intlNumber}}'), ReferenceError, 'A number must be provided.');

    });

    describe('used to format numbers', function () {
        it('should return a string', function () {
            var tmpl = "{{intlNumber 4}}",
                out;

            out = Handlebars.compile(tmpl)(undefined, defaultData);

            expect(out).to.equal("4");
        });

        it('should return a decimal as a string', function () {
            var tmpl = Handlebars.compile('{{intlNumber NUM}}'),
                out = tmpl({
                    NUM: 4.004
                }, defaultData);

            expect(out).to.equal("4.004");
        });

        it('should return a formatted string with a thousand separator', function () {
            var tmp = Handlebars.compile('{{intlNumber NUM}}'),
                out = tmp({
                    NUM: 40000
                }, defaultData);

            expect(out).to.equal('40,000');
        });

        it('should return a formatted string with a thousand separator and decimal', function () {
            var tmp = Handlebars.compile('{{intlNumber NUM}}'),
                out = tmp({
                    NUM: 40000.004
                }, defaultData);

            expect(out).to.equal('40,000.004');
        });

        describe('in another locale', function () {
            it('should return a string', function () {
                var tmpl = '{{intlNumber 4 locale="de-DE"}}',
                    out;

                out = Handlebars.compile(tmpl)(undefined, defaultData);

                expect(out).to.equal("4");
            });

            it('should return a decimal as a string', function () {
                var tmpl = Handlebars.compile('{{intlNumber NUM locale="de-DE"}}'),
                    out = tmpl({
                        NUM: 4.004
                    }, defaultData);

                expect(out).to.equal("4,004");
            });

            it('should return a formatted string with a thousand separator', function () {
                var tmp = Handlebars.compile('{{intlNumber NUM locale="de-DE"}}'),
                    out = tmp({
                        NUM: 40000
                    }, defaultData);

                expect(out).to.equal('40.000');
            });

            it('should return a formatted string with a thousand separator and decimal', function () {
                var tmp = Handlebars.compile('{{intlNumber NUM locale="de-DE"}}'),
                    out = tmp({
                        NUM: 40000.004
                    }, defaultData);

                expect(out).to.equal('40.000,004');
            });
        });

    });

    describe('used to format currency', function () {
        it('should return a string formatted to currency', function () {
            var tmp = Handlebars.compile('{{intlNumber 40000 style="currency" currency=CURRENCY}}'),
                out = tmp({
                    CURRENCY: 'USD'
                }, defaultData);

            expect(out, 'USD').to.equal('$40,000.00');

            tmp = Handlebars.compile('{{intlNumber 40000 style="currency" currency=CURRENCY}}');
            out = tmp({
                CURRENCY: 'EUR'
            }, defaultData);
            expect(out, 'EUR').to.equal('€40,000.00');

            tmp = Handlebars.compile('{{intlNumber 40000 style="currency" currency=CURRENCY}}');
            out = tmp({
                CURRENCY: 'JPY'
            }, defaultData);
            expect(out, 'JPY').to.equal('¥40,000');
        });

        it('should return a string formatted to currency with code', function () {
            var tmp = Handlebars.compile('{{intlNumber 40000 style="currency" currency=CURRENCY currencyDisplay="code"}}'),
                out = tmp({
                    CURRENCY: 'USD'
                }, defaultData);

            expect(out, 'USD').to.equal('USD40,000.00');

            tmp = Handlebars.compile('{{intlNumber 40000 style="currency" currency=CURRENCY currencyDisplay="code"}}');
            out = tmp({
                CURRENCY: 'EUR'
            }, defaultData);
            expect(out, 'EUR').to.equal('EUR40,000.00');

            tmp = Handlebars.compile('{{intlNumber 40000 style="currency" currency=CURRENCY currencyDisplay="code"}}');
            out = tmp({
                CURRENCY: 'JPY'
            }, defaultData);
            expect(out, 'JPY').to.equal('JPY40,000');
        });

        it('should function within an `each` block helper', function () {
            var tmp = Handlebars.compile('{{#each currencies}} {{intlNumber AMOUNT style="currency" currency=CURRENCY}}{{/each}}'),
                out = tmp({
                    currencies: [
                        { AMOUNT: 3, CURRENCY: 'USD'},
                        { AMOUNT: 8, CURRENCY: 'EUR'},
                        { AMOUNT: 10, CURRENCY: 'JPY'}
                    ]
                }, defaultData);

            // note the output must contain the correct spaces to match the template
            expect(out).to.equal(' $3.00 €8.00 ¥10');
        });

        it('should return a currency even when using a different locale', function (){
            var tmp = Handlebars.compile('{{intlNumber 40000 locale="de-DE" style="currency" currency=CURRENCY}}'),
                out = tmp({
                    CURRENCY: 'USD'
                }, defaultData);

            expect(out, 'USD->de-DE').to.equal('40.000,00 $');

            tmp = Handlebars.compile('{{intlNumber 40000 locale="de-DE" style="currency" currency=CURRENCY}}');
            out = tmp({
                CURRENCY: 'EUR'
            }, defaultData);
            expect(out, 'EUR->de-DE').to.equal('40.000,00 €');

            tmp = Handlebars.compile('{{intlNumber 40000 locale="de-DE" style="currency" currency=CURRENCY}}');
            out = tmp({
                CURRENCY: 'JPY'
            }, defaultData);
            expect(out, 'JPY->de-DE').to.equal('40.000 ¥');
        });
    });

    describe('used to format percentages', function () {
        it('should return a string formatted to a percent', function () {
            var tmp = Handlebars.compile('{{intlNumber 400 style="percent"}}');

            expect(tmp(undefined, defaultData)).to.equal('40,000%');
        });

        it('should return a perctage when using a different locale', function () {
            var tmp = Handlebars.compile('{{intlNumber 400 locale="de-DE" style="percent"}}');

            expect(tmp(undefined, defaultData)).to.equal('40.000 %');
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
        assert.throw(Handlebars.compile('{{intlDate}}'), ReferenceError, 'A date or time stamp must be provided.');
    });

    // Use a fixed known date
    var dateStr = 'Thu Jan 23 2014 18:00:44 GMT-0500 (EST)',
        timeStamp = 1390518044403;

    it('should return a formatted string', function () {
        var tmp = Handlebars.compile('{{intlDate "' + dateStr + '"}}');

        expect(tmp(undefined, defaultData)).to.equal('1/23/2014');

        // note timestamp is passed as a number
        tmp = Handlebars.compile('{{intlDate ' + timeStamp + '}}');

        expect(tmp(undefined, defaultData)).to.equal('1/23/2014');
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

        expect(tmp(undefined, defaultData)).to.equal('6:00 PM');
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
        assert.throw(Handlebars.compile('{{intlMessage}}'), ReferenceError, 'A string must be provided.');
    });

    it('should return a formatted string', function () {
        var tmp = Handlebars.compile('{{intlMessage MSG firstName=firstName lastName=lastName}}'),
            out = tmp({
                MSG: 'Hi, my name is {firstName} {lastName}.',
                firstName: 'Anthony',
                lastName: 'Pipkin'
            }, defaultData);

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
            }, defaultData);

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
            }, defaultData);

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
            }, defaultData);

        expect(out).to.equal(' Allison harvested 10 apples. Jeremy harvested 60 apples.');
    });

    it('should supply its own currency value for messages', function () {
        var tmp = Handlebars.compile('{{intlMessage MSG amount=amount currency="EUR"}}'),
            out = tmp({
                MSG: 'I have {amount, number, currency}.',
                amount: 23.45
            }, defaultData);

        expect(out).to.equal('I have €23.45.');
    });

    it('should return an error if no token is provided', function () {
        assert.throw(function () {
            var tmp = Handlebars.compile('{{intl amount=amount}}'),
                out = tmp({
                    MSG: 'I have {amount, number, currency}.',
                    amount: 23.45
                }, defaultData);
        }, SyntaxError, 'A value or a token must be provided.');
    });

    describe('with a token', function () {

        it('should return a message', function () {
            var tmp = Handlebars.compile('{{intl token="MSG" amount=amount}}'),
                out = tmp({
                    MSG: 'I have {amount, number, currency}.',
                    amount: 23.45
                }, defaultData);

            expect(out).to.equal('I have $23.45.');
        });

        it('should return an error if the token is not found', function () {
            assert.throw(function () {
                var tmp = Handlebars.compile('{{intl token="BAD_TOKEN" amount=amount}}'),
                    out = tmp({
                        MSG: 'I have {amount, number, currency}.',
                        amount: 23.45
                    }, defaultData);
            }, ReferenceError, 'Could not find path BAD_TOKEN in [object Object] at BAD_TOKEN');

        });

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
            out = tmp({
                NUM: 40000.004
            }, defaultData);

        expect(out).to.equal('40.000,004');
    });

    it('should pass off to format a date', function (){
        var tmp = Handlebars.compile('{{intl date}}'),
            out = tmp({
                    date: new Date('Thu Jan 23 2014 18:00:44 GMT-0500 (EST)')
                }, defaultData);

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
            }, defaultData);

        expect(out).to.equal(' Allison harvested 10 apples. Jeremy harvested 60 apples.');
    });

    describe('as a block helper', function () {
        it('should maintain a locale', function () {
            var str = '{{intl NUM}} {{#intl locale="de-DE"}}{{intl ../NUM}}{{/intl}} {{intl NUM}}',
                tmp = Handlebars.compile(str),
                out = tmp({
                    NUM: 40000.004
                }, defaultData);

            expect(out).to.equal('40,000.004 40.000,004 40,000.004');
        });

        it('should maintain a currency', function () {
            var str = '{{intl NUM style="currency"}}' +
                      '{{#intl currency="EUR"}} {{intl ../NUM style="currency"}} {{/intl}}' +
                      '{{intl NUM style="currency"}}',
                tmp = Handlebars.compile(str),
                out = tmp({
                    NUM: 40000.006
                }, defaultData);

            expect(out).to.equal('$40,000.01 €40,000.01 $40,000.01');
        });

        it('should maintain context regardless of depth', function () {
            var str = '{{#intl locale="de-DE"}}' +
                       '{{#intl locale="en-US"}}{{intl NUM}} {{/intl}}' +
                       '{{intl NUM}}' +
                      '{{/intl}} ' +
                      '{{intl NUM}}',
                tmp = Handlebars.compile(str),
                out = tmp({
                    NUM: 40000.004
                }, defaultData);

            expect(out).to.equal('40,000.004 40.000,004 40,000.004');
        });

    });
});

describe('Helper formatters', function () {
    describe('for intlDate', function () {
        it('should return null when asked for an unset key', function () {
            var format = IntlHelpers.getDateTimeFormat('time_short');

            expect(format).to.equal(null);
        });

        it('should return the object after it is set', function () {
            IntlHelpers.setDateTimeFormat('time_short', {
                timeZone: 'UTC',
                hour    : 'numeric',
                minute  : 'numeric'
            });

            var format = IntlHelpers.getDateTimeFormat('time_short');

            expect(format).to.be.an('object');
        });

        it('should format a date using the formatter', function () {
            IntlHelpers.setDateTimeFormat('time_short', {
                timeZone: 'UTC',
                hour    : 'numeric',
                minute  : 'numeric'
            });

            var tmp = Handlebars.compile('{{intlDate DATE format="time_short"}}'),
                out = tmp({
                    DATE: new Date('Thu Jan 23 2014 18:00:44 GMT-0500 (EST)')
                }, defaultData);

            expect(out).to.equal('6:00 PM');
        });
    });

    describe('for Number', function () {
        it('should return null when asked for an unset key', function () {
            var format = IntlHelpers.getNumberFormat('euros');

            expect(format).to.equal(null);
        });

        it('should return the object after it is set', function () {
            IntlHelpers.setNumberFormat('euros', {
                currency: 'EUR',
                style   : 'currency'
            });

            var format = IntlHelpers.getNumberFormat('euros');

            expect(format).to.be.an('object');
        });

        it('should format a date using the formatter', function () {
            IntlHelpers.setNumberFormat('euros', {
                currency: 'EUR',
                style   : 'currency'
            });

            var tmp = Handlebars.compile('{{intlNumber MONEY format="euros"}}'),
                out = tmp({ MONEY: 45.39 }, defaultData);

            expect(out).to.equal('€45.39');
        });
    });
});

