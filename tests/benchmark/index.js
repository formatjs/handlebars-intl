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
                // {
                //     valueName: 'num',
                //     type     : 'number',
                //     format   : 'integer'
                // }
            ]
        }
    }
};

var now = new Date();

new Benchmark.Suite('NumberFormat', suiteConfig)
    .add('NumberFormat', function () {
        new Intl.NumberFormat('en-US', {
            currency: 'USD',
            style   : 'currency'
        }).format(4000);
    })
    .add('intlNumber', function () {
        intlNumber(4000, {
            data: data,
            hash: {
                style   : 'currency',
                currency: 'USD'
            }
        });
    })
    .run();

new Benchmark.Suite('DateTimeFormat', suiteConfig)
    .add('DateTimeFormat', function () {
        new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            year   : 'numeric',
            month  : 'long',
            day    : 'numeric'
        }).format(now);
    })
    .add('intlDate', function () {
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
    .add('intlMessage', function () {
        intlMessage('The number is: {num, number, integer}', {
            data: data,
            hash: {
                num: 4000
            }
        });
    })
    .add('intlMessage Cache', function () {
        intlMessage({
            data: data,
            hash: {
                num     : 4000,
                intlName: 'foo'
            }
        });
    })
    .run();
