/// <reference path='../node_modules/@types/jest/index.d.ts' />

import Vue = require('vue')
import * as vts from '../src/vue-typescript-component'

class Foo {
	someString = 'abc'
	someNumber = 123
	someArray = [123, 'abc']
	someObject = {aString: 'abc', aNumber: 123, aArray: [123, 'abc']}
}

@vts.component()
class JustData extends Vue {
	someString = 'abc'
	someNumber = 123
	someArray = [123, 'abc']
	someObject = {aString: 'abc', aNumber: 123, aArray: [123, 'abc']}
	someFoo = new Foo()
}

it('creates the expected options', () => {
	expect((<any>JustData).vueComponentOptions).toMatchSnapshot()
})
it('creates the expected data', () => {
	expect((<any>JustData).vueComponentOptions.data()).toMatchSnapshot()
})
