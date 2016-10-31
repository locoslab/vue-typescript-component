/// <reference path='../node_modules/@types/jest/index.d.ts' />

import Vue = require('vue')
import * as vts from '../src/vue-typescript-component'


// global, because data is not available in all hooks
let history = []

@vts.component()
class LifecycleHook extends Vue {
	blub = 1
	beforeCreate() { history.push('beforeCreate') }
	created() { history.push('created') }
	beforeMount() { history.push('beforeMount') }
	mounted() { history.push('mounted') }
	beforeUpdate() { history.push('beforeUpdate') }
	updated() { history.push('updated') }
	// not yet tested
	activated() { history.push('activated') }
	// not yet tested
	deactivated() { history.push('deactivated') }
	beforeDestroy() { history.push('beforeDestroy') }
	destroyed() { history.push('destroyed') }

	render(createElement: typeof Vue.prototype.$createElement) {
		return createElement('h1', this.blub)
	}
}

it('creates the expected options', () => {
	expect((<any>LifecycleHook).vueComponentOptions).toMatchSnapshot()
})
it('creates the expected data', () => {
	expect((<any>LifecycleHook).vueComponentOptions.data()).toMatchSnapshot()
})
it('creates the expected html', () => new Promise(function(resolve, reject) {
	history = []
	// beforeDestroy/destroyed is not called for children (not sure if intentional)
	// -> make the component the global instance
	const vm = new (Vue.extend((<any>LifecycleHook).vueComponentOptions))().$mount()

	Vue.nextTick( () => {
		(<any>vm).blub = 2
		Vue.nextTick( () => {
			vm.$destroy()
			expect(history).toEqual([
				'beforeCreate',
				'created',
				'beforeMount',
				'mounted',
				'beforeUpdate',
				'updated',
				'beforeDestroy',
				'destroyed',
			])
			resolve()
		})
	})
}))
