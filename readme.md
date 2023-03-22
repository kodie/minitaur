# minitaur

[![npm package version](https://img.shields.io/npm/v/minitaur.svg?style=flat-square)](https://www.npmjs.com/package/minitaur)
[![Travis build status](https://img.shields.io/travis/com/kodie/minitaur.svg?style=flat-square)](https://travis-ci.com/kodie/minitaur)
[![npm package downloads](https://img.shields.io/npm/dt/minitaur.svg?style=flat-square)](https://www.npmjs.com/package/minitaur)
[![code style](https://img.shields.io/badge/code_style-standard-yellow.svg?style=flat-square)](https://github.com/standard/standard)
[![license](https://img.shields.io/github/license/kodie/minitaur.svg?style=flat-square)](license.md)

The ultimate, dependency-free, easy to use, JavaScript plugin for creating and managing modals.


## Demo

Visit https://kodie.github.io/minitaur


## Installation


### Manual Download

Download [dist/minitaur.min.js](dist/minitaur.min.js) and place the following HTML in your page's head element:

```html
<script type="text/javascript" src="dist/minitaur.min.js"></script>
```


### CDN (Courtesy of [jsDelivr](https://jsdelivr.com))

Place the following HTML in your page's head element (check to make sure the version in the URL is the version you want):

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/kodie/minitaur@0.0.2/dist/minitaur.min.js"></script>
```


### [NPM](https://npmjs.com)

```
npm install minitaur --save
```

```js
// ES6
import minitaur from 'minitaur'

// CommonJS
const minitaur = require('minitaur')
```


### [GPM](https://github.com/itsahappymedium/gpm)

```
gpm install kodie/minitaur --save
```


### [Bower](https://bower.io)

```
bower install kodie/minitaur --save
```


## Usage


### The `minitaur` Function

Initiates minitaur.


#### Parameters

If the first parameter is set to an object, it will be used as the options parameter and the mount parameter will be set to the option object's `mount` value.


##### `mount`

Default: `'.minitaur, [data-minitaur]'`

The element(s) to turn into minitaur modals. Optional. Accepts `String`, `NodeList`, `HTMLElement`, or `false`. See the `mount` option for more information.

##### `options`

Default: *(See `Options` section)*

An object of options you can set to configure the modal(s). Optional. Accepts `Object`. See the `Options` section for more information.


#### Examples

```js
window.addEventListener('load', function () {
  // Initialize minitaur with default options on all elements with the `minitaur` class or `data-minitaur` attribute
  minitaur()

  // Mount a different element as a modal
  minitaur('.modal')

  // Mount a custom element as a modal, and add a class to it
  minitaur(document.getElementById('my-element'), { class: 'alert' })

  // This does exactly the same as the above
  minitaur({
    class: ['alert'],
    mount: document.getElementById('my-element')
  })

  // Create a modal without using a pre-existing element, apply some custom styling, have it takeover and be opened, and close it after 5 seconds
  minitaur({
    afterOpen: function (modal) {
      setTimeout(function () {
        modal.minitaur.close()
      }, 5000)
    },
    content: '<p>Hi! I was created out of no where! But you can <a href="#" data-minitaur-close>close me</a> if you want.</p>',
    mount: false,
    opened: true,
    style: {
      backgroundColor: '#fff',
      padding: '10px'
    },
    takeover: true
  })

  // Mount an element, but store it in a variable and change it's content after initialization
  var myModal = minitaur('#alert')
  myModal.minitaur.set('content', '<span>This is an alert!</span>')

  // Let's change it's class and apply some styling too
  myModal.minitaur.set({
    class: 'viewed',
    style: {
      color: '#ff0000'
    }
  })

  // We can also get it after initialization and control it this way
  var alsoMyModal = document.getElementById('alert')
  alsoMyModal.minitaur.close()

  // We can do this as well
  minitaur.close(document.getElementById('alert'))
})
```

View the source of [index.html](index.html) for more examples.


#### Options


##### `afterClose`

Default: `null`

A function to run after the modal has been closed. Receives the modal instance as it's first parameter. Accepts a `Function`.


##### `afterInit`

Default: `null`

A function to run after the modal has been initiated. Receives the modal instance as it's first parameter. Accepts a `Function`.


##### `afterOpen`

Default: `null`

A function to run after the modal has been opened. Receives the modal instance as it's first parameter. Accepts a `Function`.


##### `anchor`

Default: `null`

The element that the modal should base it's size and position on. Accepts a `String` that will be passed to `document.querySelector`, an `HTMLElement`, or an `Object` containing `x` and/or `y` keys set to the before mentioned types to have the modal base it's horizontal and vertical positions on two different elements.

If this (or either of the `x`/`y` object keys) is set to `'viewport'`, the currently visible viewport will be used, also the modal's position will automatically be updated when the user scrolls the page.

If this (or either of the `x`/`y` object keys) is set to `null`, it will default to `document.body` unless the modal was opened via a `trigger` in which case it will default to the element that initiated the triggered event.


##### `backdropClass`

Default: `'minitaur-backdrop'`

The class that is applied to the backdrop of a modal. Accepts a `String`. This is only used if the modal's `takeover` option is set to `true`.


##### `backdropClosingStyle`

Default: `null`

The style to apply to the backdrop of the modal while it is being closed. Accepts an `Object` of keys and values that will be applied to the `style` property of the backdrop element or `null` to not apply any styling. This is only used if the modal's `takeover` option is set to `true`.


##### `backdropOpeningStyle`

Default: `null`

The style to apply to the backdrop of the modal while it is being opened. Accepts an `Object` of keys and values that will be applied to the `style` property of the backdrop element or `null` to not apply any styling. This is only used if the modal's `takeover` option is set to `true`.


##### `backdropStyle`

Default: `{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }`


The style to apply to the backdrop of the modal. Accepts an `Object` of keys and values that will be applied to the `style` property of the backdrop element or `null` to not apply any styling. This is only used if the modal's `takeover` option is set to `true`.


##### `beforeClose`

Default: `null`

A function to run before the modal has been closed. Receives the modal instance as it's first parameter. Accepts a `Function`.


##### `beforeInit`

Default: `null`

A function to run before the modal has been initiated. Receives the modal instance as it's first parameter. Accepts a `Function`.


##### `beforeOpen`

Default: `null`

A function to run before the modal has been opened. Receives the modal instance as it's first parameter. Accepts a `Function`.


##### `breakpoints`

Default: `null`

An `Object` of options that are set depending on the browser window's width. Accepts an object containing numeric strings as keys (the browser width breakpoint) set to objects containing keys of other options to be set if the browser's width matches the breakpoint. Accepts an `Object`.


##### `class`

Default: `'minitaur'`

A class or classes to apply to the modal. Accepts a `String` or an `Array` of `String`s.


##### `closeClass`

Default: `'closed'`

The class that is applied to the modal after it has been closed. Accepts a `String`.


##### `closeDuration`

Default: `0`

The number of milliseconds the modal should take to close. Useful for applying animations to the modal close event. Accepts a `Number`.


##### `closingClass`

Default: `'closing'`

The class that is applied to the modal while it is closing. Accepts a `String`.


##### `closingStyle`

Default: `null`

The style to apply to the modal while it is being closed. Accepts an `Object` of keys and values that will be applied to the `style` property of the modal or `null` to not apply any styling.


##### `closeOnFocusOut`

Default: `true`

If set to `true`, the modal will be closed if any element outside of the modal is focused on or clicked. Accepts a `Boolean`.


##### `closeStyle`

Default: `{ display: 'none', visibility: 'hidden' }`

The style to apply to the modal after it has been closed. Accepts an `Object` of keys and values that will be applied to the `style` property of the modal or `null` to not apply any styling.


##### `content`

Default: `null`

The HTML content to set for the modal. Can be left set to `null` if mounting a pre-existing element that has content already. Accepts a `String` or a `Function` that is passed the modal instance as it's first parameter and returns a `String`.

Any instances of `{parameter}` will be replaced with it's value in the `parameters` option.


##### `id`

Default: `null`

The id to set for the modal. If left set to `null` it will only set the id if one isn't already set on the mounted element, in which case the id will be set to `minitaur-[modalCount]`. Accepts a `String`.

This should really only be used when the `mount` option is set to `false`.


##### `mount`

Default: `'.minitaur, [data-minitaur]'`

An element to mount as the modal. Accepts a string that will be passed to `document.querySelector`, a `NodeList`, an `HTMLElement`, or `false` to create a new element.


##### `opened`

Default: `false`

Set to `true` to have the modal be opened after initialization. Accepts a `Boolean`.


##### `openClass`

Default: `'opened'`

The class that is added to the modal after it has been opened. Accepts a `String`.


##### `openDuration`

Default: `0`

The number of milliseconds the modal should take to open. Useful for applying animations to the modal open event. Accepts a `Number`.


##### `openingClass`

Default: `'opening'`

The class that is applied to the modal while it is opening. Accepts a `String`.


##### `openingStyle`

Default: `{ display: 'block', visibility: 'visible' }`

The style to apply to the modal while it is being opened. Accepts an `Object` of keys and values that will be applied to the `style` property of the modal or `null` to not apply any styling.


##### `openStyle`

Default: `null`

The style to apply to the modal after it has been opened. Accepts an `Object` of keys and values that will be applied to the `style` property of the modal or `null` to not apply any styling.


##### `parameters`

Default: `null`

An `Object` containing keys that instances of `{key}` in the modal's HTML content should be replaced with it's value. Accepts an `Object` or `null` to not set any parameters.


##### `position`

Default: `'middle'`

Possible horizontal position values: `'left'`, `'inner-left'`, `'middle'`, `'inner-right'`, `'right'`

Possible vertical position values: `'top'`, `'inner-top'`, `'middle'`, `'inner-bottom'`, `'bottom'`

The position of the modal based on the `anchor` element's size/position. Accepts a `String` with a single position value that will be used for both the horizontal and vertical position (ex. `middle`), a `String` with the vertical position first and horizontal position second separated by a space (ex. `top right`), or an `Object` containing `x` and/or `y` keys with their values set to their respective position value (ex. `{ x: 'right', y: 'top' }`).

This option also accepts a `Number`, or a numeric `String` to manually set the pixel position based on the `anchor` element's size/position. A numeric `String` that ends with a percentage symbol (`%`) can also be used to set the position based on a percentage of the `anchor` element's size/position.

The modal will automatically reposition itself anytime the browser window is resized.


##### `respectAnchorSpacing`

Default: `false`

Set to `true` to have the anchor element's margin/padding calculated when setting the modal position. Accepts a `Boolean`.

The modal's own margin/padding is always respected.


##### `stayInBounds`

Default: `true`

If set to `true`, the modal will automatically reposition itself if the calculated position makes it go outside of `document.body` or out of the bounds of the `anchor` element (if one of the `position` option keys are set to `'inner-left'`, `'inner-right'`, `'inner-top'`, or `'inner-bottom'`, otherwise it's supposed to be out of the bounds of the anchor element), or if it overlaps the `anchor` element (if the `anchor` element is not `document.body` and one of the `position` option keys are set to `'left'`, `'right'`, `'top'`, or `'bottom'` otherwise it's supposed to overlap). Accepts a `Boolean`.


##### `style`

Default: `null`

The style to apply to the modal. Accepts an `Object` of keys and values that will be applied to the `style` property of the modal or `null` to not apply any styling.


##### `takeover`

Default: `false`

Set to `true` to have a backdrop added behind the modal and disable page scroll while the modal is open. Accepts a `Boolean`.

A modal with this option enabled will have it's `anchor` option locked to `'viewport'` and will have the `data-minitaur-taking-over` data attribute applied to it while it is open.

The backdrop element will also get the `closingClass`, `openClass`, and `openingClass` classes applied just like the modal. Additionally, it's id will be set to `[modal-id]-backdrop` and will get the `data-minitaur-backdrop="#[modal-id]"` data attribute applied to it.

The backdrop element will get it's `zIndex` style property set to `99998` and the modal's set to `99999` unless either one of these are overwritten by any style options.

Also, when a modal with this option enabled is opened, any other modals with this option enabled will be closed.


##### `template`

Default: `null`

The HTML to use as a template for the modal content. Any instances of `{minitaur-content}` will be replaced with the modal's content. Parameters from the `parameters` option can be used here too. Accepts a `String` or `Function`.

Example:

```js
minitaur('.minitaur-modal', {
  template: '{minitaur-content}<button type="button" class="btn btn-primary" data-minitaur-close>Close Me</button>'
})
```

You can also define templates to use later by setting them in the `minitaur.templates` object and setting the `template` option to it's key rather than the HTML content.

Templates can be a function that is passed the modal as it's only parameter and returns a string.

Example:

```js
minitaur.templates.myModal = '{minitaur-content}<button type="button" class="btn btn-primary" data-minitaur-close>Close Me</button>'

minitaur('.minitaur-modal', {
  template: 'myModal'
})
```

```html
<div class="minitaur-modal">
  <p>Hi, I'm a minitaur modal. :)</p>
</div>
```

Will result in:

```html
<div class="minitaur-modal minitaur minitaur-template-myModal">
  <div class="minitaur-content">
    <p>Hi, I'm a minitaur modal. :)</p>
  </div>
  <button type="button" class="btn btn-primary" data-minitaur-close>Close Me</button>
</div>
```

*Tip: When using templates, your content gets wrapped in a div with the `minitaur-content` class. To use something other than a div, wrap the `{minitaur-content}` in an element of your choice with the `minitaur-content` class when setting the template content in the `minitaur.templates` object. For example: `<span class="minitaur-content">{minitaur-content}</span>`*


##### `triggers`

Default: `[]`

Possible action values: `'close'`, `'open'`, `'toggle'`

Elements to add event listeners to that perform certain actions on the modal. Accepts a `String`/`Array` of `String`s that will be passed to `document.querySelector`, or an `Object`/`Array` of `Object`s containing at the very least an `elements` key set to the before mentioned types. The `action` key can be set to one of the above action values (defaults to `'toggle'`), and/or an `events` key can be set to a `String`/`Array` of `String`s defining the type of event listener that should be used (defaults to `'click'`).

Examples:

```js
minitaur({
  triggers: '.toggles-modal-when-clicked'
})

minitaur({
  triggers: [
    '.toggles-modal-when-clicked',
    '.also-toggles-modal-when-clicked',
    {
      action: 'open', // Defaults to "toggle"
      elements: '.opens-modal-when-hovered',
      events: 'mouseover' // Defaults to "click"
    },
    {
      action: 'close',
      elements: [
        '.closes-modal-when-unhovered-or-clicked',
        '.also-closes-modal-when-unhovered-or-clicked'
      ],
      events: [
        'mouseout',
        'click'
      ]
    }
  ]
})
```


#### Defaults Options

```js
// All default options
minitaur({
  afterClose: null,
  afterInit: null,
  afterOpen: null,
  anchor: null,
  backdropClass: 'minitaur-backdrop',
  backdropClosingStyle: null,
  backdropOpeningStyle: null,
  backdropStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  beforeClose: null,
  beforeInit: null,
  beforeOpen: null,
  breakpoints: null,
  class: 'minitaur',
  closeClass: 'closed',
  closeDuration: 0,
  closingClass: 'closing',
  closingStyle: null,
  closeOnFocusOut: true,
  closeStyle: {
    display: 'none',
    visibility: 'hidden'
  },
  content: null,
  id: null,
  mount: '.minitaur, [data-minitaur]',
  opened: false,
  openClass: 'opened',
  openDuration: 0,
  openingClass: 'opening',
  openingStyle: {
    display: 'block',
    visibility: 'visible'
  },
  openStyle: null,
  parameters: null,
  position: 'middle',
  respectAnchorSpacing: false,
  stayInBounds: true,
  style: null,
  takeover: false,
  template: null,
  triggers: []
})
```


### Modal Data Attributes

Most options above can be set by setting `data-minitaur-*` attributes on a pre-existing element that will be used in the `mount` option (ex: `data-minitaur-anchor="#my-div"`, `data-minitaur-respect-anchor-spacing="true"`). You can also define `breakpoints` options as well (ex: `data-minitaur-breakpoints-768-position-x="right"`).


#### Example

```html
<div id="my-modal" class="minitaur" data-minitaur-anchor="#my-div" data-minitaur-respect-anchor-spacing="true" data-minitaur-breakpoints-768-position-x="right">
  <p>Hi, I'm a minitaur modal.</p>
</div>
```


### Trigger Data Attributes

Trigger elements can be defined (in addition to using the `triggers` option) using the `data-minitaur-close`, `data-minitaur-open`, or `data-minitaur-toggle` data attributes set to a selector for the modal (ex. `data-minitaur-open="#my-modal"`).

The value can be omitted from the trigger element if it's inside of a modal (ex. An element inside of a modal with the `data-minitaur-close` attribute not set to anything would close the modal that it is inside of).

Additionally, any modal data attributes as described in the above section can also be applied to trigger elements to set those options on the modal when the trigger element is triggered.


#### Example

```html
<div id="my-modal" class="minitaur" data-minitaur-respect-anchor-spacing="true" data-minitaur-breakpoints-768-position-x="right">
  <p>Hi, I'm a minitaur modal. You can <a href="#" data-minitaur-close>close me</a> if you want.</p>
</div>

<button type="button" data-minitaur-toggle="#my-modal" data-minitaur-anchor="#my-div">Toggle Modal</button>
```


### Global Methods

The global `minitaur` object has the following methods that can be used:

#### `close`

Closes a modal/modals. Accepts a `String` that will be passed to `document.querySelector`, a `NodeList` or an `HTMLElement` as the first parameter to specify the modal to close and optionally an `Object` containing options to set as the second parameter.


#### `kill`

Deinitializes a modal/modals. Accepts a `String` that will be passed to `document.querySelector`, a `NodeList`, or an `HTMLElement` as the first parameter to specify the modal to deinitialize and optionally a `Boolean` to decide to put the original element back the way it was before initialization as the second parameter (defaults to `true`).


#### `open`

Opens a modal/modals. Accepts a `String` that will be passed to `document.querySelector`, a `NodeList`, or an `HTMLElement` as the first parameter to specify the modal to open and optionally an `Object` containing options to set as the second parameter.


#### `set`

Sets options for a modal. Accepts a `String` that will be passed to `document.querySelector`, a `NodeList`, or an `HTMLElement` as the first parameter to specify the modal to set options for and an `Object` containing options to set as the second parameter. The second parameter also accepts a `String` set to an option key, in that case a third parameter should be defined to set that option's value.


#### `toggle`

Toggles a modal/modals' open state. Accepts a `String` that will be passed to `document.querySelector`, a `NodeList`, or an `HTMLElement` as the first parameter to specify the modal to open/close and optionally an `Object` containing options to set as the second parameter.


#### Examples

```js
minitaur.close('#my-modal')

minitaur.kill('#my-modal', false)

minitaur.open('#my-modal', {
  afterOpen: function (modal) {
    console.log('My modal was opened')
  }
})

minitaur.set('#my-modal', {
  afterClose: function (modal) {
    console.log('My modal was closed')
  }
})

minitaur.toggle('#my-modal')
```


### Modal Methods

The `minitaur` property is added to the modal with the following methods that can be used:


#### `close`

Closes the modal. Optionally accepts an `Object` containing options to set as the first parameter.


#### `kill`

Deinitializes the modal. Optionally accepts a `Boolean` to decide to put the original element back the way it was before initialization as the first parameter (defaults to `true`).


#### `open`

Opens the modal. Optionally accepts an `Object` containing options to set as the first parameter.


#### `set`

Sets options for the modal. Accepts an `Object` containing options to set as the first parameter. The first parameter also accepts a `String` set to an option key, in that case a second parameter should be defined to set that option's value.


#### `toggle`

Toggles the modal's open state. Optionally accepts an `Object` containing options to set as the first parameter.


#### Examples

```js
modal.minitaur.close()

modal.minitaur.kill(false)

modal.minitaur.open({
  afterOpen: function (modal) {
    console.log('My modal was opened')
  }
})

modal.minitaur.set({
  afterClose: function (modal) {
    console.log('My modal was closed')
  }
})

modal.minitaur.toggle()
```


### Modal Properties

The `minitaur` property is added to the modal with the following properties that can be used to detect the modal's current state:


#### `isOpen`

Is set to `true` if the modal is currently open, otherwise `false`.


#### Example

```js
function checkIfMyModalIsOpen(modal) {
  if (modal.minitaur.isOpen) {
    console.log('My modal is open')
  } else {
    console.log('My modal is not open')
  }
}
```


### Modal Events

The following events are triggered on a modal when an action is performed:


#### `close`

Fires when the modal is closed.


#### `open`

Fires when the modal is opened.


#### Examples

```js
modal.addEventListener('open', function (e) {
  console.log('My modal was opened')
})

modal.addEventListener('close', function (e) {
  console.log('My modal was closed')
})
```


### Styling

minitaur doesn't come with any default styling (except for the `backdropStyle`, `closeStyle`, and `openingStyle` option defaults) and doesn't require you to embed any CSS. However the modals can be very easily styled either by using CSS or by setting any of the style options available.


#### Examples

##### Basic Styling

```css
.minitaur {
  background-color: #fff;
  border: 1px solid #000;
  border-radius: 5px;
  padding: 10px;
  text-align: center;
}
```


##### Animations

```js
minitaur({
  closeDuration: 250
})
```

```css
.minitaur {
  transition: opacity .25s ease, left .25s ease, top .25s ease;
}

.minitaur[data-minitaur-taking-over],
.minitaur-backdrop {
  transition: opacity .25s ease;
}

.minitaur.closing,
.minitaur.opening,
.minitaur-backdrop.closing,
.minitaur-backdrop.opening {
  opacity: 0
}
```


## Related

 - [filebokz](https://github.com/kodie/filebokz) - A tiny, dependency-free, highly customizable and configurable, easy to use file input with some pretty sweet features.

 - [hashjump](https://github.com/kodie/hashjump) - A tiny, dependency-free JavaScript module for handling anchor links and scrolling elements into view.

 - [colorfield](https://github.com/kodie/colorfield) - A tiny, dependency-free, color input field helper that utilizes the native color picker.

 - [vanishing-fields](https://github.com/kodie/vanishing-fields) - A dependency-free, easy to use, JavaScript plugin for hiding and showing fields.


## License

MIT. See the [license file](license.md) for more info.
