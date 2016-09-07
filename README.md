# vue-typescript-component [![Build Status](https://travis-ci.org/locoslab/vue-typescript-component.svg?branch=master)](https://travis-ci.org/locoslab/vue-typescript-component)
Use TypeScript 2.0 classes as vue 2.0 components primarily targeting a vueify setup.

Note: This projects targets TypeScript 2.0 and vue 2.0 that are currently still in development and is also work in progress. Please cf. [package.json](package.json) for the tested versions.

## Usage
Install: `npm install --save-dev locoslab/vue-typescript-component`

### Example Component
```typescript
import Vue = require('vue')
import * as vts from 'vue-typescript-component'
import * as ChildComponent from './child.vue'

@vts.component({components: {ChildComponent}})
class Example extends Vue {
	// this will be part of 'data'
	aString = 'abc'
	aNumber = 123

	// props
	@vts.prop() aStringPropWithValue = 'abc'
	@vts.prop() aNumberPropWithValue = 123

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
	aMethod() { return 'aMethod' }

	// a lifecycle hook (identified by its name)
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
import Example from './example.ts'
export default Example.vueComponentOptions
</script>
```


## Acknowledgements
There are a few other implementations using similar concepts. While this project has been implemented from scratch, <https://github.com/itsFrank/vue-typescript> and <https://github.com/usystems/vuejs-typescript-component> have been helpful during development. If this project does not meet your needs, check out the others!

## License
[MIT](http://opensource.org/licenses/MIT)
