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
    HandlebarsHelperIntl.registerWith(Handlebars);
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
var ctx = {NUM: 40.5, OTHER: .50}; //context passed into the template
var tmpl = `<b>{{intlNumber NUM style="percent"}} and {{intlNumber OTHER style="percent"}} </b>`;
```

Output:

```html
<b>4,050% and 50%</b>
```


#### Percentages (de-DE)
( `{{#intl locales='de-DE'}}` )

Template:

```js
var ctx = {NUM: 40.5, OTHER: .50}; //context passed into the template
var tmpl = `<b>{{intlNumber NUM style="percent"}} and {{intlNumber OTHER style="percent"}} </b>`;
```

Output:

```html
<b>4 050 % and 50 %</b>
```

### @intlDate

Note: Examples below use

```js
var dateStr   = 'Thu Jan 23 2014 18:00:44 GMT-0500 (EST)',
        timeStamp = 1390518044403;
```

#### Convert from date string

Template:

```js
var tmpl = `<p>Date: {{intlDate dateStr}}</p>`;
```

Output:

```html
<p>Date: 1/23/2014</p>
```

#### Convert from timestamp

Template:

```js
var tmpl = `<p>Date: {{intlDate timeStamp}}</p>`;
```

Output:

```html
<p>Date: 1/23/2014</p>
```

#### Formatting the output

Template:

```js
var tmpl = `<p>Time: {{intlDate timeStamp hour="numeric" minute="numeric" timeZone="UTC"}}</p>`;
```

Output:

```html
<p>Time: 11:00 PM</p>
```

#####Configuration properties

| Property    | Allowed values                                   |
| ----------: | :----------------------------------------------- |
|      weekday| "narrow", "short", "long"                        |
|          era| "narrow", "short", "long"                        |
|         year| "2-digit", "numeric"                             |
|        month| "2-digit", "numeric", "narrow", "short", "long"  |
|          day| "2-digit", "numeric"                             |
|         hour| "2-digit", "numeric"                             |
|       minute| "2-digit", "numeric"                             |
|       second| "2-digit", "numeric"                             |
| timeZoneName| "short", "long"                                  |

[Source](https://github.com/andyearnshaw/Intl.js/blob/17ad3e99a821e5121cafaa117517ebd3ca4c0804/Intl.js#L2121).





### @intlMessage

NOTE: `var ctx` is the context passed into the handlebars template.

#### Basic String

Template:

```js
var tmpl = `<b>{{intlMessage "Hi, my name is {firstName} {lastName}." firstName="Anthony" lastName="Pipkin"}}</b>`
```

Output:

```html
<b>Hi, my name is Anthony Pipkin</b>
```


#### Formatted String (en-US)

Template:

```js
var tmpl='<p>{{intlMessage "{city} has a population of {population, number, integer} as of {census_date,date,medium}" city=city population=population census_date=census_date timeZone=timeZone}}</p>';

var ctx={
    city: 'Atlanta',
    population: 5475213,
    census_date: (new Date('1/1/2010')).getTime(),
    timeZone: 'UTC'
};
```

Output:

```html
<p>Atlanta has a population of 5,475,213 as of Jan 1, 2010.</p>
```



#### String plurals

Template:

```js

var tmpl = '<p>{{intlMessage HARVEST_MSG person=person count=count }}</p>',
    ctx = {
        HARVEST_MSG: '{person} harvested {count, plural, one {# apple} other {# apples}}.',
        person: 'Allison',
        count: 10
    };

```
or

```html
<b>{{intlMessage "{person} harvested {count, plural, one {# apple} other {# apples}}" person="Jeremy" count=1}}</b>
```


Output:

```html
<p>Jeremy harvested 1 apple.</p>
```

### @intlGet

Allows you to access your translated strings by name. Helps with modularizing your translations.

Wrapper:
```html
{{#intl locales=intl.locale messages=intl.messages}}
   ...
{{/intl}}
```

Template:
```js

var intl {
    messages: {
        TITLE: 'Welcome to the Internet'
    }
};

var tmpl = '<title>{{intlMessage (intlGet "messages.TITLE")}}</title>';

```

Output:

```html
<title>Welcome to the Internet</title>
```


### @intlHTMLMessage

Returns an unescaped Handlebars `SafeString`.

Template:

```js
var tmpl=`{{intlHTMLMessage "<a href='https://example.com/test/demo_form.asp?name1=value1&name2=value2'>hi</a>"}}`;
```

Output (unescaped):

```html
<a href='https://example.com/test/demo_form.asp?name1=value1&name2=value2'>hi</a>
```

## License

This software is free to use under the Yahoo! Inc. BSD license.
See the [LICENSE file][] for license text and copyright information.

[LICENSE file]: https://github.com/yahoo/handlebars-helper-intl/blob/master/LICENSE




