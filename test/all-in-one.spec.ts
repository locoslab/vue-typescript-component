/// <reference path='../node_modules/@types/jest/index.d.ts' />

import Vue = require('vue')
import { Component, prop, watch } from '../src/vue-typescript-component'

@Component
class AllInOne extends Vue {
	aString = 'abc'
	aNumber = 123
	// tslint:disable-next-line:variable-name
	_thisWillBeIgnored = 345
	$asWillThis = 345

	@prop aStringPropWithValue = 'abc'
	@prop aNumberPropWithValue = 123

	@prop aStringProp: string
	@prop aNumberProp: number

	get aComputedString(): string { return this.aString }
	set aComputedString(value: string) { this.aString = value }

	get aComputedNumber(): number { return this.aNumber }
	set aComputedNumber(value: number) { this.aNumber = value }

	get aComputedStringGetter(): string { return this.aString }
	get aComputedNumberGetter(): number { return this.aNumber }

	aMethod() { return 'aMethod' }

	// a lifecycle hook
	created() { /* do nothing */ }

	@watch('aString') aStringWatch(val: string, oldVal: string) { /* do nothing */ }
}

it('creates the expected options', () => {
	expect((<any>AllInOne).vueComponentOptions).toMatchSnapshot()
})
it('creates the expected data', () => {
	expect((<any>AllInOne).vueComponentOptions.data()).toMatchSnapshot()
})
