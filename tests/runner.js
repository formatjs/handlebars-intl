/* global Handlebars */
/* jshint node:true */
'use strict';

if (typeof Intl === 'undefined') {
    global.Intl = require('intl');
}

global.Handlebars = require('handlebars');
global.expect = require('expect.js');

require('../').registerWith(Handlebars);

require('./helpers');
