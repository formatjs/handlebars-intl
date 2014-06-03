handlebars-helper-intl
======================

Handlebars helpers for internationalization.

[![Build Status](https://travis-ci.org/yahoo/handlebars-helper-intl.png)](https://travis-ci.org/yahoo/handlebars-helper-intl)


## Installation


### Browser

1. Install with [bower](http://bower.io/): `bower install handlebars-helper-intl`
2. Load the scripts into your page. (It does not matter which order the scripts are loaded in.)

    ```html
    <script src="handlebars.js"></script>
    <script src="handlebars-helper-intl.js"></script>
    ```

3. Register the helpers:

    ```javascript
    HandlebarsHelperIntl.register(Handlebars);
    ```


### Node/CommonJS

1. You can install the helpers with npm: `npm install handlebars-helper-intl`
2. Load in the module and register it:

    ```javascript
    var Handlebars = require('handlebars');
    global.Intl = require('intl');
    require('handlebars-helper-intl').register(Handlebars);
    ```

    **NOTE:**  Since node (as of 0.10) doesn't provide the global `Intl` object
    (ECMA-402) you'll need to provide a polyfill.  The `intl` NPM package can
    provide this or you can use another.


### AMD

1. Install with [bower](http://bower.io/): `bower install handlebars-form-helpers`
3. Load in the module and register it:

    ```javascript
    define(['handlebars', 'handlebars-helper-intl'], function(Handlebars, HandlebarsHelperIntl) {
        HandlebarsHelperIntl.register(Handlebars);
    });
    ```

(Thanks to the `handlebars-form-helpers` package for figuring out how to register helpers in multiple environments.)


## Usage

NOTE: All the examples below should be assumed to be wrapped by

```html
{{#intl locales='[somelocale]'}}
[content here]
{{/intl}}
```
in order to have the `intl` context in handlebars.

### @intlNumber

#### Basic (en-US)
( `{{#intl locales='en-US'}}` )

Template:

```js
var tmpl = '<b>{{intlNumber 40000}}</b>';
```

Output:

```html
<b>40,000</b>
```

#### Basic (de-DE)
( `{{#intl locales='de-DE'}}` )


Template:

```js
var tmpl = '<b>{{intlNumber 40000.004}}</b>'

```

Output:

```html
<b>40.000,004</b>
```


#### Currency (USD)

Template:

```js
var tmpl = `<b>{{intlNumber 40000 style="currency" currency="USD"}}</b>`;
```

Output:

```html
<b>$40,000.00</b>
```


#### Currency (EUR)

Template:

```js
var tmpl = `<b>{{intlNumber 40000 style="currency" currency="EUR"}}</b>`;
```

Output:

```html
<b>€40,000.00</b>
```

#### Currency (JPY)

Template:

```js
var tmpl = `<b>{{intlNumber 40000 style="currency" currency="JPY"}}</b>`;
```

Output:

```html
<b>¥40,000</b>
```

#### Currency (USD) with code

Template:

```js
var tmpl = `<b>{{intlNumber 40000 style="currency" currency="USD" currencyDisplay="code"}}</b>`;
```

Output:

```html
<b>USD40,000.00</b>
```


#### Percentages (en-US)

Template:

```js
var tmpl = `<b>{{intlNumber 400 style="percent"}}</b>`;
```

Output:

```html
<b>40,000 %</b>
```


#### Percentages (de-DE)
( `{{#intl locales='de-DE'}}` )

Template:

```js
var tmpl = `<b>{{intlNumber 400 style="percent"}}</b>`;
```

Output:

```html
<b>40.000 %</b>
```


