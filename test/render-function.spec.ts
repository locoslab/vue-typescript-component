/// <reference path='../node_modules/@types/jest/index.d.ts' />

import Vue = require('vue')
import * as vts from '../src/vue-typescript-component'

@vts.component()
class RenderFunction extends Vue {
	@vts.prop() level = 3
	@vts.prop() text = 'a heading'

	render(createElement: typeof Vue.prototype.$createElement) {
		return createElement('h' + this.level, this.text)
	}
}

it('creates the expected options', () => {
	expect((<any>RenderFunction).vueComponentOptions).toMatchSnapshot()
})
it('creates the expected data', () => {
	expect((<any>RenderFunction).vueComponentOptions.data()).toMatchSnapshot()
})
it('creates the expected html', () => new Promise(function(resolve, reject) {
	const vm = new Vue({
		el: document.createElement('div'),
		render: (h) => h((<any>RenderFunction).vueComponentOptions),
	})
	Vue.nextTick( () => {
		expect(vm.$el.outerHTML).toBe('<h3>a heading</h3>')
		resolve()
	})
}))
