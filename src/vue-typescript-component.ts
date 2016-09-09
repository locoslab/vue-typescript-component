import Vue = require('vue')

export class WatchOptions {
	expression: string
	options: { handler: Vue.WatchHandler } & Vue.WatchOptions
}

export class VueTypescriptComponentData {
	props: {[index: string]: Vue.PropOptions} = {}
	watch: {[index: string]: Array<WatchOptions>} = {}
}

function getOrCreateComponent(target: any): VueTypescriptComponentData {
	if (typeof target !== 'object') {
		throw 'VueTypescriptComponent decorator is only allowed for non-static members'
	}
	if (!target.hasOwnProperty('$$vueTypescriptComponentData')) {
		target.$$vueTypescriptComponentData = new VueTypescriptComponentData()
	}
	return target.$$vueTypescriptComponentData
}

/** Use field as property
 * If field is initialized, sets default value and type. Otherwise mark as required
 */
export function prop(options: Vue.PropOptions = {}) {
	return function (target: any, member: string) {
		getOrCreateComponent(target).props[member] = options
	}
}

/** Use method(val, oldVal) to watch expression
 * The method is still part of the `method` object and it is possible to use multiple @watch
 * annotations to watch multiple expressions with one string
 */
export function watch(expression: string, options: Vue.WatchOptions = {}) {
	return function (target: any, member: string) {
		const wo = new WatchOptions()
		wo.expression = expression
		wo.options = <{ handler: Vue.WatchHandler } & WatchOptions>options
		const watch = getOrCreateComponent(target).watch
		if (!watch[member]) {
			watch[member] = []
		}
		watch[member].push(wo)
	}
}

export interface NoArgumentConstructable {
	new (): any
	vueComponentOptions?: Vue.ComponentOptions
}

const lifecycleHooks = ['init', 'created', 'beforeCompile', 'compiled', 'ready',
		'attached', 'detached', 'beforeDestroy', 'destroyed']

/** Create property constructor.vueComponentOptions based on method/field annotations
 *  If provided, use options as the base value (.data is always overriden)
 */
export function component(options: Vue.ComponentOptions = {}) {
	return function (cls: NoArgumentConstructable) {
		const d = <VueTypescriptComponentData>cls.prototype.$$vueTypescriptComponentData
				|| new VueTypescriptComponentData()
		const obj = new cls()
		cls.vueComponentOptions = options
		options.name = options.name || (<any>cls).name
		options.methods = options.methods || {}
		options.props = options.props || {}
		// to get rid of Index signature of object type implicitly has an 'any' type.
		const props = <{ [key: string]: Vue.PropOptions }>options.props
		options.computed = options.computed || {}
		options.watch = options.watch || {}
		options.data = function () {
			const newData = new cls()
			const r: any = {}
			for (let n of Object.getOwnPropertyNames(newData)) {
				if (!props[n] && n[0] !== '_' && n[0] !== '$') {
					r[n] = newData[n]
				}
			}
			return r
		}

		for (let n of Object.getOwnPropertyNames(d.props)) {
			props[n] = d.props[n]
		}
		// create data; add default values and types to props with initialisers
		for (let n of Object.getOwnPropertyNames(obj)) {
			if (props[n]) {
				if (props[n].default !== undefined) {
					throw 'Property "' + n + '" has initialiser and PropOptions.default (use either or)'
				}
				if (typeof obj[n] === 'object' ) {
					props[n].default = function () { return new cls()[n] }
				} else {
					props[n].default = obj[n]
				}
				if (props[n].type === undefined) {
					props[n].type = Object.getPrototypeOf(obj[n]).constructor
				}
			}
		}
		// set props without default value to required
		for (let n in props) {
			if (props[n].required === undefined && props[n].default === undefined) {
				props[n].required = true
			}
		}
		// methods
		for (let n of Object.getOwnPropertyNames(cls.prototype)) {
			if (n === 'constructor' || n === '$$vueTypescriptComponentData') {
				continue
			}
			const pd = Object.getOwnPropertyDescriptor(cls.prototype, n)
			if (pd.set) {
				options.computed![n] = { set: pd.set, get: pd.get }
			} else if (pd.get) {
				options.computed![n] = pd.get
			} else if (lifecycleHooks.indexOf(n) !== -1) {
				(<any>options)[n] = pd.value
			} else {
				options.methods![n] = pd.value
			}
		}
		// watch
		for (let n of Object.getOwnPropertyNames(d.watch)) {
			if (!options.methods![n]) {
				throw '@watch must decorate a method: ' + n
			}
			for (let o of d.watch[n]) {
				if (options.watch![o.expression]) {
					throw 'duplicate watch expression: ' + o.expression
				}
				o.options.handler = obj[n]
				options.watch![o.expression] = o.options
			}
		}
	}
}
