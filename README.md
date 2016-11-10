# vue-typescript-component [![Build Status](https://travis-ci.org/locoslab/vue-typescript-component.svg?branch=master)](https://travis-ci.org/locoslab/vue-typescript-component) [![npm version](https://badge.fury.io/js/vue-typescript-component.svg)](https://badge.fury.io/js/vue-typescript-component)
Use TypeScript 2.0 classes as Vue.js 2.0 components primarily targeting a vueify setup.

Note: This projects targets TypeScript 2.0 and Vue.js 2.0, and uses the built-in type definitions provided by Vue.js 2.0. Please cf. [package.json](package.json) for the tested versions.

For a complete example project using this package, vueify, and supporting Hot Module Replacement, checkout <https://github.com/locoslab/vue-typescript-component-example>.

## Usage
Install: `npm install --save-dev vue-typescript-component`

Note: TypeScript and Vue.js must be installed as well.

### Example Component
```typescript
import Vue = require('vue')
import * as vts from 'vue-typescript-component'
// see note about import *.vue files below
import * as ChildComponent from './child.vue'

@vts.component({components: {ChildComponent}})
export default class Example extends Vue {
	// this will be 'data'
	aString = 'abc'
	aNumber = 123

	// props with initializer -> sets default value and type
	@vts.prop() aStringPropWithValue = 'abc'
	@vts.prop() aNumberPropWithValue = 123

	// props without initializer -> sets required=true
	@vts.prop() aStringProp: string
	@vts.prop() aNumberProp: number

	// computed props
	get aComputedString(): string { return this.aString }
	set aComputedString(value: string) { this.aString = value }

	get aComputedNumber(): number { return this.aNumber }
	set aComputedNumber(value: number) { this.aNumber = value }

	get aComputedStringGetter(): string { return this.aString }
	get aComputedNumberGetter(): number { return this.aNumber }

	// methods
	aMethod() { /* ... */ }

	// a lifecycle hook (names: http://vuejs.org/api/#Options-Lifecycle-Hooks)
	created() { /* ... */ }

	// watches
	@vts.watch('aString') aStringWatch(val: string, oldVal: string) { /* ... */ }
}
```

The class can then be used in a `*.vue` file:
```html
<template>
...
</template>

<script>
module.exports = require('./example.ts').default.vueComponentOptions
</script>
```

While it would be possible to support inline TypeScript code in the `vue` file itself, we prefer separate files to make use of existing IDE/editor and tooling support for TypeScript files.

Note: to use `import` with `*.vue` files in TypeScript code, cf. <https://github.com/locoslab/vue-typescript-import-dts>

## Acknowledgements
There are a few other implementations using similar concepts. While this project has been implemented from scratch, <https://github.com/itsFrank/vue-typescript> and <https://github.com/usystems/vuejs-typescript-component> have been helpful during development. If this project does not meet your needs, check out the others!

Why this one:
* Targets Vue.js 2.0.1
* Works great with vueify which brings Hot Module Replacement
* Supports Vue.js 2 template pre-compilation during bundling (using vueify)
* Uses the new type definitions shipped with Vue.js 2.0.1
* Smart props:
	- if the prop is initialized, the type and default value is set for the prop definition and `required=false`
	- else the prop is marked as required
	- these settings can be overridden by providing an explicit `PropsOptions` parameter to the decorator

## Contributing
Contributions including bug reports, tests, and documentation are more than welcome. To get started with development:
``` bash
# once: install dependencies
npm install

# run unit tests in watch mode
npm test -- --watch

# lint & test
npm run prepublish
```

## License
[MIT](http://opensource.org/licenses/MIT)
