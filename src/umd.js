/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/
/* jslint esnext: true */

import registerWith from './helper';

var mod = {
    registerWith: registerWith
};

/* global define:true module:true window: true */
if (typeof define === 'function' && define.amd) {
  define(function() { return mod; });
} else if (typeof module !== 'undefined' && module.exports) {
  module.exports = mod;
} else if (typeof this !== 'undefined') {
  this.HandlebarsHelperIntl = mod;
}
