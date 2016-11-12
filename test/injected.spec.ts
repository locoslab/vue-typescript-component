/// <reference path='../node_modules/@types/jest/index.d.ts' />

import Vue = require('vue')
import * as vts from '../src/vue-typescript-component'

class A extends Vue {
	a = 1
	ab = 1
	abc = 1
}

@vts.component()
class B extends A {
	b = 1
	bc = 1
	@vts.injected() a: number
}

@vts.component()
class C extends B {
	@vts.injected() ab: number
	@vts.injected() b: number
	c = 1
}

it('B data is correct', () => {
	expect((<any>B).vueComponentOptions.data()).toMatchSnapshot()
})

it('C data is correct', () => {
	expect((<any>C).vueComponentOptions.data()).toMatchSnapshot()
})
