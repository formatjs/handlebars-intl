[Handlebars Intl][]
===================

This library provides [Handlebars][] helpers for internationalization. The helpers provide a declarative way to format dates, numbers, and string messages with pluralization support.

[![npm Version][npm-badge]][npm]
[![Build Status][travis-badge]][travis]
[![Dependency Status][david-badge]][david]

[![Sauce Test Status][sauce-badge]][sauce]

**This package used to be named `handlebars-helper-intl`.**


Overview
--------

**Handlebars Intl is part of [FormatJS][], the docs can be found on the webiste:**
**<http://formatjs.io/handlebars/>**

### Features

- Display numbers with separators.
- Display dates and times correctly.
- Display dates relative to "now".
- Pluralize labels in strings.
- Support for 200+ languages.
- Runs in the browser and Node.js.
- Built on standards.

### Example

There are many examples [on the website][Handlebars Intl], but here's a comprehensive one:

```handlebars
{{formatMessage (intlGet "messages.post.meta")
    num=post.comments.length
    ago=(formatRelative post.date)}}
```

```js
var context = {
    post: {
        date    : 1422046290531,
        comments: [/*...*/]
    }
};

var intlData = {
    locales : ['en-US'],
    messages: {
        post: {
            meta: 'Posted {ago}, {num, plural, one{# comment} other{# comments}}'
        }
    }
};

var template = Handlebars.compile(/* Template source above */);

var html = template(context, {
    data: {intl: intlData}
});
```

This example would render: **"Posted 3 days ago, 1,000 comments"** to the `html` variable. The `post.meta` message is written in the industry standard [ICU Message syntax][], which you can also learn about on the [FormatJS website][FormatJS].


Contribute
----------

Let's make Handlebars Intl and FormatJS better! If you're interested in helping, all contributions are welcome and appreciated. Handlebars Intl is just one of many packages that make up the [FormatJS suite of packages][FormatJS GitHub], and you can contribute to any/all of them, including the [Format JS website][FormatJS] itself.

Check out the [Contributing document][CONTRIBUTING] for the details. Thanks!


License
-------

This software is free to use under the Yahoo! Inc. BSD license.
See the [LICENSE file][LICENSE] for license text and copyright information.


[Handlebars Intl]: http://formatjs.io/handlebars/
[Handlebars]: http://handlebarsjs.com/
[npm]: https://www.npmjs.org/package/handlebars-intl
[npm-badge]: https://img.shields.io/npm/v/handlebars-intl.svg?style=flat-square
[travis]: https://travis-ci.org/yahoo/handlebars-intl
[travis-badge]: http://img.shields.io/travis/yahoo/handlebars-intl.svg?style=flat-square
[david]: https://david-dm.org/yahoo/handlebars-intl
[david-badge]: https://img.shields.io/david/yahoo/handlebars-intl.svg?style=flat-square
[sauce]: https://saucelabs.com/u/handlebars-intl
[sauce-badge]: https://saucelabs.com/browser-matrix/handlebars-intl.svg
[FormatJS]: http://formatjs.io/
[FormatJS GitHub]: http://formatjs.io/github/
[ICU Message syntax]: http://formatjs.io/guide/#messageformat-syntax
[CONTRIBUTING]: https://github.com/yahoo/handlebars-intl/blob/master/CONTRIBUTING.md
[LICENSE]: https://github.com/yahoo/handlebars-intl/blob/master/LICENSE
