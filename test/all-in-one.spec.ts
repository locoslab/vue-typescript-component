/// <reference path='../node_modules/@types/jest/index.d.ts' />

import Vue = require('vue')
import * as vts from '../src/vue-typescript-component'

@vts.component()
class AllInOne extends Vue {
	aString = 'abc'
	aNumber = 123
	// tslint:disable-next-line:variable-name
	_thisWillBeIgnored = 345
	$asWillThis = 345

	@vts.prop() aStringPropWithValue = 'abc'
	@vts.prop() aNumberPropWithValue = 123

	@vts.prop() aStringProp: string
	@vts.prop() aNumberProp: number

	get aComputedString(): string { return this.aString }
	set aComputedString(value: string) { this.aString = value }

	get aComputedNumber(): number { return this.aNumber }
	set aComputedNumber(value: number) { this.aNumber = value }

	get aComputedStringGetter(): string { return this.aString }
	get aComputedNumberGetter(): number { return this.aNumber }

	aMethod() { return 'aMethod' }

	// a lifecycle hook
	created() { /* do nothing */ }

	@vts.watch('aString') aStringWatch(val: string, oldVal: string) { /* do nothing */ }
}

it('creates the expected options', () => {
	expect((<any>AllInOne).vueComponentOptions).toMatchSnapshot()
})
it('creates the expected data', () => {
	expect((<any>AllInOne).vueComponentOptions.data()).toMatchSnapshot()
})
