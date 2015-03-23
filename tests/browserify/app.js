/* global Handlebars */
'use strict';

var HandlebarsIntl = require('../../');
require('../../lib/locales.js');

global.Handlebars = require('handlebars');
HandlebarsIntl.registerWith(Handlebars);

require('../helpers.js');
