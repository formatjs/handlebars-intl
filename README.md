Handlebars Intl
===============

Handlebars helpers for internationalization.

[![npm Version][npm-badge]][npm]
[![Build Status][travis-badge]][travis]
[![Dependency Status][david-badge]][david]

**This package used to be named `handlebars-helper-intl`.**


Overview
--------

### Goals

* Integrate internationalization features with [Handlebars][] to lower the barrier for localizing Handlebars templates.

* Build on current and emerging JavaScript [`Intl`][Intl] standards — architect in a future-focused way.

* Run in both Node.js and in the browser with a single `<script>` element.

### How It Works

**Template Source:**

```handlebars
<b>Price:</b> {{formatNumber price style="currency" currency="USD"}}
```

**Render Template:**

```js
var intlData = {
    locales: 'en-US'
}

var context = {
    price: 1000
};

var html = template(context, {
    data: {intl: intlData}
});
```

**Output:**

```html
<b>Price:</b> $1,000.00
```

### Features

* Formats **numbers** and **dates/times**, including those in complex messages using the JavaScript built-ins: [`Intl.NumberFormat`][Intl-NF] and [`Intl.DateTimeFormat`][Intl-DTF], respectively.

* Formats complex messages, including **plural** and **select** arguments using the [Intl MessageFormat][Intl-MF] library which follows [ICU Message][ICU] and [CLDR][CLDR] standards.

* Supports formatting message strings that contain HTML via the `{{formatHTMLMessage}}` helper.


Usage
-----

### `Intl` Dependency

This package assumes that the [`Intl`][Intl] global object exists in the runtime. `Intl` is present in all modern browsers _except_ Safari, and there's work happening to [integrate `Intl` into Node.js][Intl-Node].

**Luckly, there's the [Intl.js][] polyfill!** You will need to conditionally load the polyfill if you want to support runtimes which `Intl` is not already built-in.

### Registering Helpers in a Browser

First, load Handlebars and this package onto the page:

```html
<script src="handlebars.js"></script>
<script src="handlebars-intl.js"></script>
```

Then, register the helpers with Handlebars:

```js
HandlebarsIntl.registerWith(Handlebars);
```

This package will create the `HandlebarsIntl` global that has the `registerWith()` function.

### Registering Helpers in Node.js

Import Handlebars and this package, then register the Intl helpers with Handlebars:

```js
var Handlebars     = require('handlebars'),
    HandlebarsIntl = require('handlebars-intl');

HandlebarsIntl.registerWith(Handlebars);
```

### Supplying i18n Data to Handlebars

Handlebars has a **data channel** feature which is separate from the context a template is rendered with — it provides a side channel in which the `data` is piped through the template to all helpers and partials. This package uses this data channel to provide the i18n used by the helpers.

#### `data.intl.locales`

A string with a BCP 47 language tag, or an array of such strings; e.g., `"en-US"`. If you do not provide a locale, the default locale will be used, but you should _always_ provide one!

This value is used by the helpers when constructing the underlying formatters.

#### `data.intl.messages`

Any arbitrary data can be provided on the `data.intl` object; one common use is to use it hold complex message strings.

**Note:** These messages _need_ to follow the [ICU Message][ICU] standard. Luckily this is a common standard that professional translators should already be familiar with.

```js
// Static collection of messages, per-locale.
var MESSAGES = {
    foo: '{hostName} hosted the party!',
    bar: 'Pets? We have: {numPets, number, integer}',
    ...
}
```

These statically defined message strings can be provided to handlebars via `data.intl.messages`:

```js
var intlData = {
    locales : 'en-US',
    messages: MESSAGES
}

var context = {...};

// Supply the `intl` `data` object when rendering the template.
var html = template(context, {
    data: {intl: intlData}
});
```

#### `data.intl.formats`

Object with user defined options for format styles. This is used to supply custom format styles and is useful you need supply a set of options to the underlying formatter; e.g., outputting a number in USD:

```js
{
    number: {
        USD: {
            style   : 'currency',
            currency: 'USD'
        }
    },

    date: {...},
    time: {...}
}
```

These pre-defined formats map to their respective helpers of the same type, and all `data.intl.formats` are used by the `{{formatMessage}}` and `{{formatHTMLMessage}}` helpers. They can then be used by String name/path like this:

```handlebars
{{formatNumber 100 "USD"}}
```

### Helpers

#### `{{#intl}}`

Block helper used to create a new `intl` data scope by updating the [i18n data supplied to Handlebars](#supplying-i18n-data-to-handlebars) within the block. This is useful when you need to render part of the page in a particular locale, or need to supply the i18n data to Handlebars via the template context — some Handlebars integrations might not support supplying `options.data.intl` when rendering.

The following example uses `{{#intl}}` to set the locale to French and will output `"1 000"`:

```handlebars
{{#intl locales="fr-FR"}}
    {{formatNumber 1000}}
{{/intl}}
```

#### `{{intlGet}}`

Utility helper for accessing and returning the value the properties from the [i18n data supplied to Handlebars](#supplying-i18n-data-to-handlebars) via a string namespace. This provides descriptive error messages when accessing a property that is undefined, unlike Handlebars built-in data channel access syntax `@`.

The following are equivalent, both lookup the `FOO` message from `data.intl.messages.FOO`:

```handlebars
{{formatMessage (intlGet "messages.FOO")}}
{{formatMessage @intl.messages.FOO}}
```

**Parameters:**

* `namespace`: `String` namespace to lookup a value on the `data.intl` object.

#### `{{formatDate}}`

Formats dates using [`Intl.DateTimeFormat`][Intl-DTF], and returns the formatted string value.

```handlebars
{{formatDate now weekday="long" timeZone="UTC"}}
```

```js
var intlData = {locales: 'en-US'};

var html = template({now: Date.now()}, {
    data: {intl: intlData}
});

console.log(html); // => "Tuesday, August 12, 2014"
```

**Parameters:**

* `date`: `Date` instance or `String` timestamp to format.

* `[format]`: Optional String path to a predefined format on [`data.intl.formats`](#dataintlformats). The format's values are merged with any hash argument values.

**Hash Arguments:**

The hash arguments passed to this helper become the `options` parameter value when the [`Intl.DateTimeFormat`][Intl-DTF] instance is created.

#### `{{formatTime}}`

This delegates to the `{{formatDate}}` helper, but first it will reference any String named `format` from [`data.intl.formats.time`](#dataintlformats).

#### `{{formatNumber}}`

Formats numbers using [`Intl.NumberFormat`][Intl-NF], and returns the formatted string value.

```handlebars
{{formatNumber price style="currency" currency="USD"}}
```

```js
var intlData = {locales: 'en-US'};

var html = template({price: 100}, {
    data: {intl: intlData}
});

console.log(html); // => "$100.00"
```

**Parameters:**

* `number`: `Number` to format.

* `[format]`: Optional String path to a predefined format on [`data.intl.formats`](#dataintlformats). The format's values are merged with any hash argument values.

**Hash Arguments:**

The hash arguments passed to this helper become the `options` parameter value when the [`Intl.NumberFormat`][Intl-NF] instance is created.

#### `{{formatMessage}}`

Formats [ICU Message][ICU] strings with the given values supplied as the hash arguments.

```
You have {numPhotos, plural,
    0= {no photos.}
    1= {one photo.}
    other {# photos.}}
```

```handlebars
{{formatMessage (intlGet "messages.photos") numPhotos=numPhotos}}
```

```js
var MESSAGES = {
    photos: '...', // String from code block above.
    ...
};

var intlData = {
    locales : 'en-US',
    messages: MESSAGES
};

var html = template({numPhotos: 1}, {
    data: {intl: inltData}
});

console.log(html); // => "You have one photo."
```

**Parameters:**

* `message`: `String` message or [`IntlMessageFormat`][Intl-MF] instance to format with the given hash arguments as the values.

  **Note:** It is recommended to access the `message` from the [i18n data supplied to Handlebars](#supplying-i18n-data-to-handlebars) using the `{{intlGet}}` helper or `@intl`-data syntax, instead of including the literal message string in the template.

**Hash Arguments:**

The hash arguments represent the name/value pairs that are used to format the `message` by providing values for its argument placeholders.

#### `{{formatHTMLMessage}}`

This delegates to the `{{formatMessage}}` helper, but will first HTML-escape all of the hash argument values. This allows the `message` string to contain HTML and it will be considered safe since it's part of the template and not user-supplied data.

**Note:** The recommendation is to remove all HTML from message strings, but sometimes it can be impractical, in those cases, this helper can be used.


License
-------

This software is free to use under the Yahoo! Inc. BSD license.
See the [LICENSE file][LICENSE] for license text and copyright information.


[npm]: https://www.npmjs.org/package/handlebars-intl
[npm-badge]: https://img.shields.io/npm/v/handlebars-intl.svg?style=flat
[travis]: https://travis-ci.org/yahoo/handlebars-intl
[travis-badge]: http://img.shields.io/travis/yahoo/handlebars-intl.svg?style=flat
[david]: https://david-dm.org/yahoo/handlebars-intl
[david-badge]: https://img.shields.io/david/yahoo/handlebars-intl.svg?style=flat
[Handlebars]: http://handlebarsjs.com/
[Intl-MF]: https://github.com/yahoo/intl-messageformat
[Intl]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
[Intl-NF]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
[Intl-DTF]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
[ICU]: http://userguide.icu-project.org/formatparse/messages
[CLDR]: http://cldr.unicode.org/
[Intl.js]: https://github.com/andyearnshaw/Intl.js
[Intl-Node]: https://github.com/joyent/node/issues/6371
[LICENSE]: https://github.com/yahoo/handlebars-intl/blob/master/LICENSE
