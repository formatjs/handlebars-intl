/* global Handlebars, Intl, IntlPolyfill */
/* jshint node:true */
'use strict';

// Force use of Intl.js Polyfill to serve as a mock.
require('intl');
Intl.NumberFormat   = IntlPolyfill.NumberFormat;
Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;

global.Handlebars = require('handlebars');
global.expect = require('expect.js');

require('../').registerWith(Handlebars);

require('./helpers');
