# as24-autocomplete

Build your autocomplete from the building blocks. Put input, data source and suggestions list inside the `as24-autocomplete` and you get it. For the moment we have these:

- Input (_as24-autocomplete-input_)
- Suggestions lists ([more info](src/suggestions-lists/readme.md))
  - Plain list (_as24-plain-suggestions-list_)
  - Grouped list (_as24-grouped-suggestions-list_)
- Data sources ([more info](src/data-sources/readme.md))
  - Plain data source (_as24-plain-data-source_)
  - Grouped data source  (_as24-grouped-suggestions-list_)

Please, check the [demo](https://autoscout24.github.io/as24-autocomplete/) out.

## Getting Started

### Run the demo

```
npm install
gulp dev
```

Goto: [http://localhost:3000](http://localhost:3000)

### How to include in your project

```
npm install --save-dev as24-autocomplete
```

Include the scripts into your build process:


All at once:
```js
require('as24-autocomplete');
```

... or just what is needed:
```js
const input = require('as24-autocomplete/src/as24-autocomplete-input');
const dataSource = require('as24-autocomplete/src/data-sources/plain-data-source');
const list = require('as24-autocomplete/src/suggestions-lists/plain-suggestions-list');
const dispatcher = require('as24-autocomplete/src/as24-autocomplete-dispatcher');

input();
dataSource();
list();
dispatcher();
```

Using the second approach can save you a few KBs. But... it's up to you.

Include the styles into your project. You can use SASS module importer ([this](https://www.npmjs.com/package/sass-module-importer) one for example)

```scss
@import 'as24-autocomplete'
```

Or just `@import` it from `node_modules`:

```scss
@import 'node_modules/as24-autocomplete/src/as24-autocomplete.sass'
```

### Example

This is how you add the autocomplete itself:

```html
<as24-autocomplete empty-list-message="No items satisfying your request">
  <input data-role="value" type="hidden" name="makeId">
  <as24-autocomplete-input class="as24-autocomplete__input-wrapper">
    <input type="text" data-role="user-query" class="as24-autocomplete__input" placeholder="Optional placeholder">
    <div class="as24-autocomplete__icon-wrapper">
      <div class="as24-autocomplete__icon-dropdown">
        <svg class="as24-autocomplete__icon-dropdown__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 7" height="16px" width="16px">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M6.5 7L0 .5.5 0l6 6 5.9-6 .6.5"></path>
        </svg>
      </div>
      <div class="as24-autocomplete__icon-cross">
        <svg class="as24-autocomplete__icon-cross__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="16px" width="16px">
          <rect x="-2" y="6.8" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -3.2215 7.7782)" width="20" height="1"/>
          <rect x="-3" y="6.8" transform="matrix(0.7071 0.7071 -0.7071 0.7071 7.7786 -3.2215)" width="20" height="1"/>
        </svg>
      </div>
    </div>
  </as24-autocomplete-input>
  <!-- <ul class="as24-autocomplete__list"></ul> -->
  <as24-plain-suggestions-list data-role="list" class="as24-autocomplete__list"></as24-plain-suggestions-list>
  <as24-plain-data-source role="data-source">
    <item key="1" value="qwer"></item>
    <!-- ... -->
  </as24-plain-data-source>
</as24-autocomplete>
```

## Migrations

#### Migration to 2.x

The new components has been introduced so that you can configure your autocomplete. These are:

- `as24-plain-suggestions-list`
- `as24-grouped-suggestions-list`
- `as24-plain-data-source`
- `as24-grouped-items-data-source`

When you use `as24-grouped-items-data-source` you should place the items within `group` element.

Please, check the [demo](https://scout24.github.io/as24-autocomplete/) out

#### Migration to 1.x

Please, pay attention to `data-role="user-query"` and `data-role="value"` attributes for the inputs.

## The End

Happy autocompleting :)
