import Vue = require('vue')

export class WatchOptions {
	expression: string
	options: { handler: Vue.WatchHandler<Vue> } & Vue.WatchOptions
}

export class VueTypescriptComponentData {
	props: {[index: string]: Vue.PropOptions} = {}
	watch: {[index: string]: WatchOptions[]} = {}
	injected: {[index: string]: Object} = {}
}

// implementation Object.assign (targets only the scope of this project)
function objAssign<T, U, V>(target: T, source1: U, source2?: V): T & U & V {
	if (source1) {
		for (let n of Object.getOwnPropertyNames(source1)) {
			Object.defineProperty(target, n, Object.getOwnPropertyDescriptor(source1, n))
		}
	}
	if (source2) {
		for (let n of Object.getOwnPropertyNames(source2)) {
			Object.defineProperty(target, n, Object.getOwnPropertyDescriptor(source2, n))
		}
	}
	return <T & U & V>target
}

function getOrCreateComponent(target: any): VueTypescriptComponentData {
	if (typeof target !== 'object') {
		throw 'VueTypescriptComponent decorator is only allowed for non-static members'
	}
	if (!target.hasOwnProperty('$$vueTypescriptComponentData')) {
		let superInjected = {}
		if (target.$$vueTypescriptComponentData) {
			superInjected = objAssign({}, target.$$vueTypescriptComponentData.injected)
		}
		target.$$vueTypescriptComponentData = new VueTypescriptComponentData()
		target.$$vueTypescriptComponentData.injected = superInjected
	}
	return target.$$vueTypescriptComponentData
}

/** Use field as property
 * If field is initialized, sets default value and type. Otherwise mark as required
 */
export function prop(options: Vue.PropOptions = {}) {
	return (target: any, member: string) => {
		getOrCreateComponent(target).props[member] = options
	}
}

/** Ignore field
 * Use on injected fields to make sure they do not appear in data()
 */
export function injected() {
	return (target: any, member: string) => {
		getOrCreateComponent(target).injected[member] = {}
	}
}

/** Use method(val, oldVal) to watch expression
 * The method is still part of the `methods` object and it is possible to use multiple @watch
 * annotations to watch multiple expressions with one function
 */
export function watch(expression: string, options: Vue.WatchOptions = {}) {
	return (target: any, member: string) => {
		const wo = new WatchOptions()
		wo.expression = expression
		wo.options = <{ handler: Vue.WatchHandler<Vue> } & WatchOptions>options
		const watch = getOrCreateComponent(target).watch
		if (!watch[member]) {
			watch[member] = []
		}
		watch[member].push(wo)
	}
}

export interface NoArgumentConstructable {
	new (): any
	name?: any
	vueComponentOptions?: Vue.ComponentOptions<Vue>
}

const lifecycleHooks = ['beforeCreate', 'created', 'beforeMount', 'mounted',
		'beforeUpdate', 'updated', 'activated', 'deactivated',
		'beforeDestroy', 'destroyed',
		'render', /* not a lifecyle hook, but handled identically */
]

/** Create property constructor.vueComponentOptions based on method/field annotations
 *  If provided, use options as the base value (.data is always overridden)
 */
export function component(options: Vue.ComponentOptions<Vue> = {}) {
	return (cls: NoArgumentConstructable) => {
		const d = getOrCreateComponent(cls.prototype)
		const superOptions: Vue.ComponentOptions<Vue> = <Vue.ComponentOptions<Vue>>cls.vueComponentOptions || {}
		const obj = new cls()
		cls.vueComponentOptions = options
		options.name = options.name || (<any>cls).name
		options.methods = objAssign({}, superOptions.methods, options.methods)
		options.computed = objAssign({}, superOptions.computed, options.computed)
		options.watch = objAssign({}, superOptions.watch, options.watch)
		options.props = objAssign({}, superOptions.props, options.props)
		// to get rid of Index signature of object type implicitly has an 'any' type.
		const props = <{ [key: string]: Vue.PropOptions }>options.props
		options.data = () => {
			const newData = new cls()
			const r: any = {}
			for (let n of Object.getOwnPropertyNames(newData)) {
				if (!props[n] && n[0] !== '_' && n[0] !== '$' && !d.injected[n]) {
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
				if (typeof obj[n] === 'object') {
					props[n].default = () => { return new cls()[n] }
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
				throw '@watch must decorate a method: ' + cls.name + '.' + n
			}
			for (let o of d.watch[n]) {
				if (options.watch![o.expression] && superOptions.watch![o.expression] !== options.watch![o.expression]) {
					throw 'duplicate watch expression: ' + cls.name + '.' + o.expression
				}
				o.options.handler = obj[n]
				options.watch![o.expression] = o.options
			}
		}
	}
}
