/// <reference path='../node_modules/@types/jest/index.d.ts' />

import Vue = require('vue')
import * as vts from '../src/vue-typescript-component'

class Foo {
	someString = 'abc'
	someNumber = 123
	someArray = [123, 'abc']
	someObject = {aString: 'abc', aNumber: 123, aArray: [123, 'abc']}
}

function getabc() {
	return 'abc'
}

@vts.component
class JustProps extends Vue {
	@vts.prop someString = 'abc'
	@vts.prop someNumber = 123
	@vts.prop someArray = [123, 'abc']
	@vts.prop someObject = {aString: 'abc', aNumber: 123, aArray: [123, 'abc']}
	@vts.prop someFoo = new Foo()
	@vts.prop someFunction = getabc

	render(createElement: typeof Vue.prototype.$createElement) {
		return createElement('div', JSON.stringify({
			someString: this.someString,
			someNumber: this.someNumber,
			someArray: this.someArray,
			someObject: this.someObject,
			someFoo: this.someFoo,
			someFunction: typeof(this.someFunction) === 'function' ? this.someFunction() : 'NOT A FUNCTION',
		}, null, '  '))
	}
}

it('creates the expected options', () => {
	expect((<any>JustProps).vueComponentOptions).toMatchSnapshot()
})

it('accepts the intended props', () => new Promise((resolve, reject) => {
	const vm = new (Vue.extend((<any>JustProps).vueComponentOptions))({
		propsData: {
			someString: 'abc',
			someNumber: 123,
			someArray: [123, 'abc'],
			someObject: {aString: 'abc', aNumber: 123, aArray: [123, 'abc']},
			someFoo: new Foo(),
			someFunction: getabc,
		},
	}).$mount(document.createElement('div'))
	vm.$nextTick(() => {
		expect(vm.$el.innerHTML).toMatchSnapshot()
		resolve()
	})
}))

it('rejects props with wrong types', () => {
	const mockConsoleError = jest.fn()
	console.error = mockConsoleError
	new (Vue.extend((<any>JustProps).vueComponentOptions))({
		propsData: {
			someString: 123,
			someNumber: 'abc',
			someArray: {aString: 'abc', aNumber: 123, aArray: [123, 'abc']},
			someObject: [123, 'abc'],
			someFoo: getabc,
			someFunction: new Foo(),
		},
	}).$mount(document.createElement('div'))
	expect(mockConsoleError.mock.calls).toMatchSnapshot()
})
