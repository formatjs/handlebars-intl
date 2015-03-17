/* global describe, it, expect, locale, Intl, IntlPolyfill, Handlebars */
/* jshint node:true, expr:true */

'use strict';

var timeStamp = 1390518044403;

function intlBlock(content, options) {
    var hash = [],
        option, open, close;

    for (option in options) {
        if (options.hasOwnProperty(option)) {
            hash.push(option + '=' + '"' + options[option] + '"');
        }
    }

    open  = '{{#intl ' + hash.join(' ') + '}}';
    close = '{{/intl}}';

    return Handlebars.compile(open + content + close);
}

describe('Helper `formatNumber`', function () {
    it('should be added to Handlebars', function () {
        expect(Handlebars.helpers).to.have.keys('formatNumber');
    });

    it('should be a function', function () {
        expect(Handlebars.helpers.formatNumber).to.be.a('function');
    });

    it('should throw if called with out a value', function () {
        expect(Handlebars.compile('{{formatNumber}}')).to.throwException(function (e) {
            expect(e).to.be.a(TypeError);
        });
    });

    describe('used to format numbers', function () {
        it('should return a string', function () {
            var tmpl = intlBlock('{{formatNumber 4}}', {locales: 'en-US'});
            expect(tmpl()).to.equal('4');
        });

        it('should return a decimal as a string', function () {
            var tmpl = intlBlock('{{formatNumber NUM}}', {locales: 'en-US'});
            expect(tmpl({ NUM: 4.004 })).to.equal('4.004');
        });

        it('should return a formatted string with a thousand separator', function () {
            var tmpl = intlBlock('{{formatNumber NUM}}', {locales: 'en-US'});
            expect(tmpl({ NUM: 40000 })).to.equal('40,000');
        });

        it('should return a formatted string with a thousand separator and decimal', function () {
            var tmpl = intlBlock('{{formatNumber NUM}}', {locales: 'en-US'});
            expect(tmpl({ NUM: 40000.004 })).to.equal('40,000.004');
        });

        describe('in another locale', function () {
            it('should return a string', function () {
                var tmpl = intlBlock('{{formatNumber 4}}', {locales: 'de-DE'});
                expect(tmpl()).to.equal('4');
            });

            it('should return a decimal as a string', function () {
                var tmpl = intlBlock('{{formatNumber NUM}}', {locales: 'de-DE'});
                expect(tmpl({ NUM: 4.004 })).to.equal('4,004');
            });

            it('should return a formatted string with a thousand separator', function () {
                var tmpl = intlBlock('{{formatNumber NUM}}', {locales: 'de-DE'});
                expect(tmpl({ NUM: 40000 })).to.equal('40.000');
            });

            it('should return a formatted string with a thousand separator and decimal', function () {
                var tmpl = intlBlock('{{formatNumber NUM}}', {locales: 'de-DE'});
                expect(tmpl({ NUM: 40000.004 })).to.equal('40.000,004');
            });
        });
    });

    describe('used to format currency', function () {
        it('should return a string formatted to currency', function () {
            var tmpl;

            tmpl = intlBlock('{{formatNumber 40000 style="currency" currency="USD"}}', {locales: 'en-US'});
            expect(tmpl()).to.equal('$40,000.00');

            tmpl = intlBlock('{{formatNumber 40000 style="currency" currency="EUR"}}', {locales: 'en-US'});
            expect(tmpl()).to.equal('€40,000.00');

            tmpl = intlBlock('{{formatNumber 40000 style="currency" currency="JPY"}}', {locales: 'en-US'});
            expect(tmpl()).to.equal('¥40,000');
        });

        it('should return a string formatted to currency with code', function () {
            var tmpl;

            tmpl = intlBlock('{{formatNumber 40000 style="currency" currency="USD" currencyDisplay="code"}}', {locales: 'en-US'});
            expect(tmpl()).to.equal('USD40,000.00');

            tmpl = intlBlock('{{formatNumber 40000 style="currency" currency="EUR" currencyDisplay="code"}}', {locales: 'en-US'});
            expect(tmpl()).to.equal('EUR40,000.00');

            tmpl = intlBlock('{{formatNumber 40000 style="currency" currency="JPY" currencyDisplay="code"}}', {locales: 'en-US'});
            expect(tmpl()).to.equal('JPY40,000');
        });

        it('should function within an `each` block helper', function () {
            var tmpl = intlBlock('{{#each currencies}} {{formatNumber AMOUNT style="currency" currency=CURRENCY}}{{/each}}', {locales: 'en-US'}),
                out  = tmpl({ currencies: [
                        { AMOUNT: 3, CURRENCY: 'USD'},
                        { AMOUNT: 8, CURRENCY: 'EUR'},
                        { AMOUNT: 10, CURRENCY: 'JPY'}
                    ]});

            // note the output must contain the correct spaces to match the template
            expect(out).to.equal(' $3.00 €8.00 ¥10');
        });

        it('should return a currency even when using a different locale', function (){
            var tmpl = intlBlock('{{formatNumber 40000 style="currency" currency=CURRENCY}}', {locales: 'de-DE'}),
                out  = tmpl({ CURRENCY: 'USD' });

            expect(out, 'USD->de-DE').to.equal('40.000,00 $');

            tmpl = intlBlock('{{formatNumber 40000 style="currency" currency=CURRENCY}}', {locales: 'de-DE'});
            out  = tmpl({ CURRENCY: 'EUR'});
            expect(out, 'EUR->de-DE').to.equal('40.000,00 €');

            tmpl = intlBlock('{{formatNumber 40000 style="currency" currency=CURRENCY}}', {locales: 'de-DE'});
            out  = tmpl({ CURRENCY: 'JPY'});
            expect(out, 'JPY->de-DE').to.equal('40.000 ¥');
        });
    });

    describe('used to format percentages', function () {
        it('should return a string formatted to a percent', function () {
            var tmpl = intlBlock('{{formatNumber 400 style="percent"}}', {locales: 'en-US'});
            expect(tmpl()).to.equal('40,000%');
        });

        it('should return a percentage when using a different locale', function () {
            var tmpl = intlBlock('{{formatNumber 400 style="percent"}}', {locales: 'de-DE'});
            expect(tmpl()).to.equal('40.000 %');
        });
    });
});

describe('Helper `formatDate`', function () {
    it('should be added to Handlebars', function () {
        expect(Handlebars.helpers).to.have.keys('formatDate');
    });

    it('should be a function', function () {
        expect(Handlebars.helpers.formatDate).to.be.a('function');
    });

    it('should throw if called with out a value', function () {
        expect(Handlebars.compile('{{formatDate}}')).to.throwException(function (e) {
            expect(e).to.be.a(TypeError);
        });
    });

    // Use a fixed known date
    var dateStr   = 'Thu Jan 23 2014 18:00:44 GMT-0500 (EST)',
        timeStamp = 1390518044403;

    it('should return a formatted string', function () {
        var tmpl = intlBlock('{{formatDate "' + dateStr + '"}}', {locales: 'en-US'});
        expect(tmpl()).to.equal('1/23/2014');

        // note timestamp is passed as a number
        tmpl = intlBlock('{{formatDate ' + timeStamp + '}}', {locales: 'en-US'});
        expect(tmpl()).to.equal('1/23/2014');
    });

    it('should return a formatted string of just the time', function () {
        var tmpl = intlBlock('{{formatDate ' + timeStamp + ' hour="numeric" minute="numeric" timeZone="UTC"}}', {locales: 'en-US'});
        expect(tmpl()).to.equal('11:00 PM');
    });

    it('should format the epoch timestamp', function () {
        var tmpl = intlBlock('{{formatDate 0}}', {locales: 'en-US'});
        expect(tmpl()).to.equal(new Intl.DateTimeFormat('en').format(0));
    });
});

describe('Helper `formatTime`', function () {
    it('should be added to Handlebars', function () {
        expect(Handlebars.helpers).to.have.keys('formatTime');
    });

    it('should be a function', function () {
        expect(Handlebars.helpers.formatTime).to.be.a('function');
    });

    it('should throw if called with out a value', function () {
        expect(Handlebars.compile('{{formatTime}}')).to.throwException(function (e) {
            expect(e).to.be.a(TypeError);
        });
    });

    // Use a fixed known date
    var dateStr   = 'Thu Jan 23 2014 18:00:44 GMT-0500 (EST)',
        timeStamp = 1390518044403;

    it('should return a formatted string', function () {
        var tmpl = intlBlock('{{formatTime "' + dateStr + '"}}', {locales: 'en-US'});
        expect(tmpl()).to.equal('1/23/2014');

        // note timestamp is passed as a number
        tmpl = intlBlock('{{formatTime ' + timeStamp + '}}', {locales: 'en-US'});
        expect(tmpl()).to.equal('1/23/2014');
    });

    it('should return a formatted string of just the time', function () {
        var tmpl = intlBlock('{{formatTime ' + timeStamp + ' hour="numeric" minute="numeric" timeZone="UTC"}}', {locales: 'en-US'});
        expect(tmpl()).to.equal('11:00 PM');
    });
});

describe('Helper `formatHTMLMessage`', function () {
  it('should be added to Handlebars', function () {
    expect(Handlebars.helpers).to.have.keys('formatHTMLMessage');
  });

  it('should return html, escaping all arguments', function () {
    var tmpl = intlBlock('{{formatHTMLMessage MSG firstName=firstName lastName=lastName}}', {locales: 'en-US'}),
    out  = tmpl({
      MSG      : '<strong>Hi, my name is {firstName} {lastName}.</strong>',
      firstName: '<em>Anthony</em>',
      lastName : 'Pipkin'
    });

    expect(out).to.equal('<strong>Hi, my name is &lt;em&gt;Anthony&lt;/em&gt; Pipkin.</strong>');
  });

  it('should return html, if an argument is a SafeString', function () {
    var tmpl = intlBlock('{{formatHTMLMessage MSG firstName=(strong firstName) lastName=lastName}}', {locales: 'en-US'}),
    out  = tmpl({
      MSG      : 'Hi, my name is {firstName} {lastName}.',
      firstName: 'Anthony',
      lastName : 'Pipkin'
    });

    expect(out).to.equal('Hi, my name is <strong>Anthony</strong> Pipkin.');
  });

  it('should return a string, escaping all arguments', function () {
    var tmpl = intlBlock('{{formatHTMLMessage MSG firstName=firstName lastName=lastName}}', {locales: 'en-US'}),
    out  = tmpl({
      MSG      : 'Hi, my name is {firstName} {lastName}.',
      firstName: '<em>Anthony</em>',
      lastName : '<strong>Pipkin</strong>'
    });

    expect(out).to.equal('Hi, my name is &lt;em&gt;Anthony&lt;/em&gt; &lt;strong&gt;Pipkin&lt;/strong&gt;.');
  });
});

describe('Helper `formatMessage`', function () {
    it('should be added to Handlebars', function () {
        expect(Handlebars.helpers).to.have.keys('formatMessage');
    });

    it('should be a function', function () {
        expect(Handlebars.helpers.formatMessage).to.be.a('function');
    });

    it('should throw if called with out a value', function () {
        expect(Handlebars.compile('{{formatMessage}}')).to.throwException(function (e) {
            expect(e).to.be.a(ReferenceError);
        });
    });

    it('should return a formatted string', function () {
        var tmpl = intlBlock('{{formatMessage MSG firstName=firstName lastName=lastName}}', {locales: 'en-US'}),
            out  = tmpl({
                MSG      : 'Hi, my name is {firstName} {lastName}.',
                firstName: 'Anthony',
                lastName : 'Pipkin'
            });

        expect(out).to.equal('Hi, my name is Anthony Pipkin.');
    });

    it('should return html for SafeString arguments and escape the rest of the options', function () {
      var tmpl = intlBlock('{{formatMessage MSG firstName=(strong firstName) lastName=lastName}}', {locales: 'en-US'}),
      out  = tmpl({
        MSG      : 'Hi, my name is {firstName} {lastName}.',
        firstName: 'Anthony',
        lastName : '<strong>Pipkin</strong>'
      });

      expect(out).to.equal('Hi, my name is <strong>Anthony</strong> &lt;strong&gt;Pipkin&lt;/strong&gt;.');
    });

    it('should return a formatted html string when an argument is a SafeString', function () {
      var tmpl = intlBlock('{{formatMessage MSG photos=(strong (formatNumber photos))}}', {locales: 'en-US'}),
      out  = tmpl({
        MSG      : '<em>Number</em> of photos: {photos}.',
        photos   : 100
      });

      expect(out).to.equal('&lt;em&gt;Number&lt;/em&gt; of photos: <strong>100</strong>.');
    });

    it('should return a string and escape all arguments', function () {
      var tmpl = intlBlock('{{formatMessage MSG photos=photos}}', {locales: 'en-US'}),
      out  = tmpl({
        MSG      : 'Number of photos: {photos}.',
        photos   : '<strong>100</strong>'
      });

      expect(out).to.equal('Number of photos: &amp;lt;strong&amp;gt;100&amp;lt;/strong&amp;gt;.');
    });

    it('should return a formatted string with formatted numbers and dates', function () {
        var tmpl = intlBlock('{{formatMessage POP_MSG city=city population=population census_date=census_date timeZone=timeZone}}', {locales: 'en-US'}),
            out  = tmpl({
                POP_MSG    : '{city} has a population of {population, number, integer} as of {census_date, date, long}.',
                city       : 'Atlanta',
                population : 5475213,
                census_date: (new Date('1/1/2010')).getTime(),
                timeZone   : 'UTC'
            });

        expect(out).to.equal('Atlanta has a population of 5,475,213 as of January 1, 2010.');
    });

    it('should return a formatted string with formatted numbers and dates in a different locale', function () {
        var tmpl = intlBlock('{{formatMessage POP_MSG city=city population=population census_date=census_date timeZone=timeZone}}', {locales: 'de-DE'}),
            out  = tmpl({
                POP_MSG    : '{city} hat eine Bevölkerung von {population, number, integer} zum {census_date, date, long}.',
                city       : 'Atlanta',
                population : 5475213,
                census_date: (new Date('1/1/2010')),
                timeZone   : 'UTC'
            });

        expect(out).to.equal('Atlanta hat eine Bevölkerung von 5.475.213 zum 1. Januar 2010.');
    });

    it('should return a formatted string with an `each` block', function () {
        var tmpl = intlBlock('{{#each harvest}} {{formatMessage ../HARVEST_MSG person=person count=count }}{{/each}}', {locales: 'en-US'}),
            out  = tmpl({
                HARVEST_MSG: '{person} harvested {count, plural, one {# apple} other {# apples}}.',
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
        expect(Handlebars.helpers).to.have.keys('intl');
    });

    it('should be a function', function () {
        expect(Handlebars.helpers.intl).to.be.a('function');
    });

    describe('should provide formats', function () {
        it('for formatNumber', function () {
            var tmpl = '{{#intl formats=intl.formats locales="en-US"}}{{formatNumber NUM "usd"}} {{formatNumber NUM "eur"}} {{formatNumber NUM style="currency" currency="USD"}}{{/intl}}',
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

        it('for formatDate', function () {
            var tmpl = '{{#intl formats=intl.formats locales="en-US"}}{{formatDate ' + timeStamp + ' "hm" timeZone="UTC"}}{{/intl}}',
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

        it('for formatMessage', function () {
            var tmpl = '{{#intl formats=intl.formats locales="en-US"}}{{formatMessage MSG product=PRODUCT price=PRICE deadline=DEADLINE timeZone=TZ}}{{/intl}}',
                ctx = {
                    MSG: '{product} cost {price, number, usd} (or {price, number, eur}) if ordered by {deadline, date, long}',
                    intl: {
                        formats: {
                            number: {
                                eur: { style: 'currency', currency: 'EUR' },
                                usd: { style: 'currency', currency: 'USD' }
                            }
                        }
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
