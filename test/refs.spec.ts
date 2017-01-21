/// <reference path='../node_modules/@types/jest/index.d.ts' />

import VueRuntime = require('vue')
declare function require(path: string): typeof VueRuntime
const Vue = require('../node_modules/vue/dist/vue')

import * as vts from '../src/vue-typescript-component'

@vts.component({template: '<div>{{val}}</div>'})
class Child extends Vue {
	@vts.prop val: number

	double() {
		return this.val * 2
	}
}
@vts.component({
	template: '<div>{{n}} = 2x <child :val="2" ref="child"></child></div>',
	components: {child: (<any>Child).vueComponentOptions},
})
class Parent extends Vue {
	child: Child
	n = 1

	mounted() {
		// tslint:disable-next-line
		this.child = <Child>this.$refs['child']
		this.n = this.child.double()
	}
}

it('creates the expected html', () => new Promise((resolve, reject) => {
	const vm = new Vue({
		el: document.createElement('div'),
		render: (h) => h((<any>Parent).vueComponentOptions),
	})
	Vue.nextTick( () => {
		expect(vm.$el.outerHTML).toBe('<div>4 = 2x <div>2</div></div>')
		resolve()
	})
}))
