/* global describe, it, locale */
/* jshint node:true, expr:true */

'use strict';

var chai,
    expect,
    Handlebars,
    IntlMessageFormat,
    timeStamp = 1390518044403;

if (typeof require === 'function') {
    chai = require('chai');
    Handlebars = require('handlebars');

    // Intl
    global.Intl || (global.Intl = require('intl'));
    IntlMessageFormat = require('intl-messageformat');

    require('../').registerWith(Handlebars);
}

expect = chai.expect;

function intlBlock(content, options) {
    var hash = [],
        option, open, close;

    for (option in options) {
        hash.push(option + '=' + '"' + options[option] + '"');
    }

    open  = '{{#intl ' + hash.join(' ') + '}}';
    close = '{{/intl}}';

    return Handlebars.compile(open + content + close);
}

describe('Helper `intlNumber`', function () {
    it('should be added to Handlebars', function () {
        expect(Handlebars.helpers).to.include.keys('intlNumber');
    });

    it('should be a function', function () {
        expect(Handlebars.helpers.intlNumber).to.be.a('function');
    });

    it('should throw if called with out a value', function () {
        expect(Handlebars.compile('{{intlNumber}}')).to.throw(TypeError);
    });

    describe('used to format numbers', function () {
        it('should return a string', function () {
            var tmpl = intlBlock('{{intlNumber 4}}', {locales: 'en-US'});
            expect(tmpl()).to.equal('4');
        });

        it('should return a decimal as a string', function () {
            var tmpl = intlBlock('{{intlNumber NUM}}', {locales: 'en-US'});
            expect(tmpl({ NUM: 4.004 })).to.equal('4.004');
        });

        it('should return a formatted string with a thousand separator', function () {
            var tmpl = intlBlock('{{intlNumber NUM}}', {locales: 'en-US'});
            expect(tmpl({ NUM: 40000 })).to.equal('40,000');
        });

        it('should return a formatted string with a thousand separator and decimal', function () {
            var tmpl = intlBlock('{{intlNumber NUM}}', {locales: 'en-US'});
            expect(tmpl({ NUM: 40000.004 })).to.equal('40,000.004');
        });

        describe('in another locale', function () {
            it('should return a string', function () {
                var tmpl = intlBlock('{{intlNumber 4}}', {locales: 'de-DE'});
                expect(tmpl()).to.equal('4');
            });

            it('should return a decimal as a string', function () {
                var tmpl = intlBlock('{{intlNumber NUM}}', {locales: 'de-DE'});
                expect(tmpl({ NUM: 4.004 })).to.equal('4,004');
            });

            it('should return a formatted string with a thousand separator', function () {
                var tmpl = intlBlock('{{intlNumber NUM}}', {locales: 'de-DE'});
                expect(tmpl({ NUM: 40000 })).to.equal('40.000');
            });

            it('should return a formatted string with a thousand separator and decimal', function () {
                var tmpl = intlBlock('{{intlNumber NUM}}', {locales: 'de-DE'});
                expect(tmpl({ NUM: 40000.004 })).to.equal('40.000,004');
            });
        });
    });

    describe('used to format currency', function () {
        it('should return a string formatted to currency', function () {
            var tmpl;

            tmpl = intlBlock('{{intlNumber 40000 style="currency" currency="USD"}}', {locales: 'en-US'});
            expect(tmpl()).to.equal('$40,000.00');

            tmpl = intlBlock('{{intlNumber 40000 style="currency" currency="EUR"}}', {locales: 'en-US'});
            expect(tmpl()).to.equal('€40,000.00');

            tmpl = intlBlock('{{intlNumber 40000 style="currency" currency="JPY"}}', {locales: 'en-US'});
            expect(tmpl()).to.equal('¥40,000');
        });

        it('should return a string formatted to currency with code', function () {
            var tmpl;

            tmpl = intlBlock('{{intlNumber 40000 style="currency" currency="USD" currencyDisplay="code"}}', {locales: 'en-US'});
            expect(tmpl()).to.equal('USD40,000.00');

            tmpl = intlBlock('{{intlNumber 40000 style="currency" currency="EUR" currencyDisplay="code"}}', {locales: 'en-US'});
            expect(tmpl()).to.equal('EUR40,000.00');

            tmpl = intlBlock('{{intlNumber 40000 style="currency" currency="JPY" currencyDisplay="code"}}', {locales: 'en-US'});
            expect(tmpl()).to.equal('JPY40,000');
        });

        it('should function within an `each` block helper', function () {
            var tmpl = intlBlock('{{#each currencies}} {{intlNumber AMOUNT style="currency" currency=CURRENCY}}{{/each}}', {locales: 'en-US'}),
                out  = tmpl({ currencies: [
                        { AMOUNT: 3, CURRENCY: 'USD'},
                        { AMOUNT: 8, CURRENCY: 'EUR'},
                        { AMOUNT: 10, CURRENCY: 'JPY'}
                    ]});

            // note the output must contain the correct spaces to match the template
            expect(out).to.equal(' $3.00 €8.00 ¥10');
        });

        it('should return a currency even when using a different locale', function (){
            var tmpl = intlBlock('{{intlNumber 40000 style="currency" currency=CURRENCY}}', {locales: 'de-DE'}),
                out  = tmpl({ CURRENCY: 'USD' });

            expect(out, 'USD->de-DE').to.equal('40.000,00 $');

            tmpl = intlBlock('{{intlNumber 40000 style="currency" currency=CURRENCY}}', {locales: 'de-DE'});
            out  = tmpl({ CURRENCY: 'EUR'});
            expect(out, 'EUR->de-DE').to.equal('40.000,00 €');

            tmpl = intlBlock('{{intlNumber 40000 style="currency" currency=CURRENCY}}', {locales: 'de-DE'});
            out  = tmpl({ CURRENCY: 'JPY'});
            expect(out, 'JPY->de-DE').to.equal('40.000 ¥');
        });
    });

    describe('used to format percentages', function () {
        it('should return a string formatted to a percent', function () {
            var tmpl = intlBlock('{{intlNumber 400 style="percent"}}', {locales: 'en-US'});
            expect(tmpl()).to.equal('40,000%');
        });

        it('should return a perctage when using a different locale', function () {
            var tmpl = intlBlock('{{intlNumber 400 style="percent"}}', {locales: 'de-DE'});
            expect(tmpl()).to.equal('40.000 %');
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
        expect(Handlebars.compile('{{intlDate}}')).to.throw(TypeError);
    });

    // Use a fixed known date
    var dateStr   = 'Thu Jan 23 2014 18:00:44 GMT-0500 (EST)',
        timeStamp = 1390518044403;

    it('should return a formatted string', function () {
        var tmpl = intlBlock('{{intlDate "' + dateStr + '"}}', {locales: 'en-US'});
        expect(tmpl()).to.equal('1/23/2014');

        // note timestamp is passed as a number
        tmpl = intlBlock('{{intlDate ' + timeStamp + '}}', {locales: 'en-US'});
        expect(tmpl()).to.equal('1/23/2014');
    });

    it('should return a formatted string of just the time', function () {
        var tmpl = intlBlock('{{intlDate ' + timeStamp + ' hour="numeric" minute="numeric" timeZone="UTC"}}', {locales: 'en-US'});
        expect(tmpl()).to.equal('11:00 PM');
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
        expect(Handlebars.compile('{{intlMessage}}')).to.throw(ReferenceError);
    });

    it('should return a formatted string', function () {
        var tmpl = intlBlock('{{intlMessage MSG firstName=firstName lastName=lastName}}', {locales: 'en-US'}),
            out  = tmpl({
                MSG      : new IntlMessageFormat('Hi, my name is {firstName} {lastName}.', 'en-US'),
                firstName: 'Anthony',
                lastName : 'Pipkin'
            });

        expect(out).to.equal('Hi, my name is Anthony Pipkin.');
    });

    it('should return a formatted string with formatted numbers and dates', function () {
        var tmpl = intlBlock('{{intlMessage POP_MSG city=city population=population census_date=census_date timeZone=timeZone}}', {locales: 'en-US'}),
            out  = tmpl({
                POP_MSG    : new IntlMessageFormat('{city} has a population of {population, number, integer} as of {census_date, date, long}.', 'en-US'),
                city       : 'Atlanta',
                population : 5475213,
                census_date: (new Date('1/1/2010')).getTime(),
                timeZone   : 'UTC'
            });

        expect(out).to.equal('Atlanta has a population of 5,475,213 as of January 1, 2010.');
    });

    it('should return a formatted string with formatted numbers and dates in a different locale', function () {
        var tmpl = intlBlock('{{intlMessage POP_MSG city=city population=population census_date=census_date timeZone=timeZone}}', {locales: 'de-DE'}),
            out  = tmpl({
                POP_MSG    : new IntlMessageFormat('{city} hat eine Bevölkerung von {population, number, integer} zum {census_date, date, long}.', 'de-DE'),
                city       : 'Atlanta',
                population : 5475213,
                census_date: (new Date('1/1/2010')),
                timeZone   : 'UTC'
            });

        expect(out).to.equal('Atlanta hat eine Bevölkerung von 5.475.213 zum 1. Januar 2010.');
    });

    it('should return a formatted string with an `each` block', function () {
        var tmpl = intlBlock('{{#each harvest}} {{intlMessage ../HARVEST_MSG person=person count=count }}{{/each}}', {locales: 'en-US'}),
            out  = tmpl({
                HARVEST_MSG: new IntlMessageFormat('{person} harvested {count, plural, one {# apple} other {# apples}}.', 'en-US'),
                harvest    : [
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

    describe('should provide formats', function () {
        it('for intlNumber', function () {
            var tmpl = '{{#intl formats=intl.formats locales="en-US"}}{{intlNumber NUM "usd"}} {{intlNumber NUM "eur"}} {{intlNumber NUM style="currency" currency="USD"}}{{/intl}}',
                ctx = {
                    intl: {
                        formats: {
                            number: {
                                eur: { style: 'currency', currency: 'EUR' },
                                usd: { style: 'currency', currency: 'USD' }
                            }
                        }
                    },
                    NUM: 40000.004
                };
            expect(Handlebars.compile(tmpl)(ctx)).to.equal('$40,000.00 €40,000.00 $40,000.00');
        });

        it('for intlDate', function () {
            var tmpl = '{{#intl formats=intl.formats locales="en-US"}}{{intlDate ' + timeStamp + ' "hm" timeZone="UTC"}}{{/intl}}',
                ctx = {
                    intl: {
                        formats: {
                            date: {
                                hm: { hour: 'numeric', minute: 'numeric' }
                            }
                        }
                    }
                },
                d = new Date(timeStamp);
            expect(Handlebars.compile(tmpl)(ctx)).to.equal("11:00 PM");
        });

        it('for intlMessage', function () {
            var formats = {
                number: {
                    eur: { style: 'currency', currency: 'EUR' },
                    usd: { style: 'currency', currency: 'USD' }
                }
            };

            var tmpl = '{{#intl formats=intl.formats locales="en-US"}}{{intlMessage MSG product=PRODUCT price=PRICE deadline=DEADLINE timeZone=TZ}}{{/intl}}',
                ctx = {
                    MSG: new IntlMessageFormat('{product} cost {price, number, usd} (or {price, number, eur}) if ordered by {deadline, date, long}', 'en-US', formats),
                    intl: {
                        formats: formats
                    },
                    PRODUCT: 'oranges',
                    PRICE: 40000.004,
                    DEADLINE: timeStamp,
                    TZ: 'UTC'
                };
            expect(Handlebars.compile(tmpl)(ctx)).to.equal("oranges cost $40,000.00 (or €40,000.00) if ordered by January 23, 2014");
        });
    });
});
