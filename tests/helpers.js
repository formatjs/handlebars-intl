// TODO -- this isn't really the tests yet
// ... but running this on node is a good way to see if things work

function _getLocale() {
    return 'en';
}

var Handlebars = require('handlebars');
require('../lib/helpers.js').register(Handlebars);


var tmpl = "color {{color}} x {{intlNumber 4}}";
var ctx = {color: 'red'};

var out = Handlebars.compile(tmpl)(ctx);
console.log(out);


