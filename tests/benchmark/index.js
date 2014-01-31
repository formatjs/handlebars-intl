/* global Intl */
'use strict';

global.Intl || (global.Intl = require('intl'));

var Benchmark   = require('benchmark'),
    intlMsg     = require('intl-messageformat'),
    Handlebars  = require('handlebars'),
    hbsIntl     = require('../../'),
    intlNumber  = hbsIntl.helpers.intlNumber,
    intlDate    = hbsIntl.helpers.intlDate,
    intlMessage = hbsIntl.helpers.intlMessage;

var suiteConfig = {
    onStart: function (e) {
        console.log(e.currentTarget.name + ':');
    },

    onCycle: function (e) {
        console.log(String(e.target));
    },

    onComplete: function () {
        console.log('');
    }
};

var data = {
    intl: {
        locales : 'en-US',
        messages: {
            foo: [
                'The number is: ',
                {
                    valueName: 'num',
                    type     : 'number',
                    format   : 'integer'
                }
            ]
        }
    }
};

var nf = new Intl.NumberFormat('en-US');

var now = new Date(),
    df  = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year   : 'numeric',
        month  : 'long',
        day    : 'numeric'
    });

new Benchmark.Suite('NumberFormat', suiteConfig)
    .add('new NumberFormat', function () {
        new Intl.NumberFormat('en-US').format(4000);
    })
    .add('cached NumberFormat#format', function () {
        nf.format(4000);
    })
    .add('intlNumber helper', function () {
        intlNumber(4000, {
            data: data,
            hash: {}
        });
    })
    .run();

new Benchmark.Suite('DateTimeFormat', suiteConfig)
    .add('new DateTimeFormat', function () {
        new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            year   : 'numeric',
            month  : 'long',
            day    : 'numeric'
        }).format(now);
    })
    .add('cached DateTimeFormat#format', function () {
        df.format(now);
    })
    .add('intlDate helper', function () {
        intlDate(now, {
            data: data,
            hash: {
                weekday: 'long',
                year   : 'numeric',
                month  : 'long',
                day    : 'numeric'
            }
        });
    })
    .run();

new Benchmark.Suite('MessageFormat', suiteConfig)
    .add('intlMessage helper literal', function () {
        intlMessage('The number is: {num, number, integer}', {
            data: data,
            hash: {
                num: 4000
            }
        });
    })
    .add('intlMessage helper reference', function () {
        intlMessage({
            data: data,
            hash: {
                num     : 4000,
                intlName: 'foo'
            }
        });
    })
    .run();
