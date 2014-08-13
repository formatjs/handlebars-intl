/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jshint esnext: true */

import IntlMessageFormat from 'intl-messageformat';
import {registerWith} from './helpers';

// TODO: Fix this default export "hack", by updating the Grunt plugin.
export default {
    IntlMessageFormat: IntlMessageFormat,
    registerWith     : registerWith
};
