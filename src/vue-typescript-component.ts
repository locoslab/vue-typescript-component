import Vue = require('vue')

export class WatchOptions {
	expression: string
	options: { handler: Vue.WatchHandler<Vue> } & Vue.WatchOptions
}

export class VueTypescriptComponentData {
	props: { [index: string]: Vue.PropOptions } = {}
	watch: { [index: string]: Array<WatchOptions> } = {}
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
	vueComponentOptions?: Vue.ComponentOptions<Vue>
}

const lifecycleHooks = ['init', 'created', 'beforeCompile', 'compiled', 'ready',
	'attached', 'detached', 'beforeDestroy', 'destroyed']

/** Create property constructor.vueComponentOptions based on method/field annotations
 *  If provided, use options as the base value (.data is always overriden)
 */
export function component(options: Vue.ComponentOptions<Vue> = {}) {
	return function (cls: NoArgumentConstructable) {
		const d = <VueTypescriptComponentData>cls.prototype.$$vueTypescriptComponentData
			|| new VueTypescriptComponentData()
		const obj = new cls()
		const superClass = Object.getPrototypeOf(Object.getPrototypeOf(obj))

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

		// props from super classes
		copyProps(superClass, options)
		// props of this class class
		for (let n of Object.getOwnPropertyNames(d.props)) {
			props[n] = d.props[n]
		}
		// create data; add default values and types to props with initialisers
		for (let n of Object.getOwnPropertyNames(obj)) {
			if (props[n]) {
				if (props[n].default !== undefined) {
					// check if property was set in superClass

					if (!findPropInSuper(superClass, n)) {
						throw 'Property "' + n + '" has initialiser and PropOptions.default (use either or)'
					}// else Property was defined in superClass. Will be overriden.
				}
				if (typeof obj[n] === 'object') {
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

		// methods from super classes
		copyMethodes(superClass, options)
		// methods from this class
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

		// watches from superClass
		copyWatches(superClass, options)
		// watches from this class
		for (let n of Object.getOwnPropertyNames(d.watch)) {
			if (!options.methods![n]) {
				throw '@watch must decorate a method: ' + n
			} else {
				for (let o of d.watch[n]) {
					if (options.watch![o.expression]) {
						// throw 'duplicate watch expression: ' + o.expression
					}
					o.options.handler = obj[n]
					options.watch![o.expression] = o.options
				}
			}
		}
	}
}

function findPropInSuper(superClass: any, propName: string): boolean {
	let result: boolean = false
	if (!superClass.$$vueTypescriptComponentData.props[propName]) {
		if (!(superClass === Vue.prototype)) {
			result= findPropInSuper(Object.getPrototypeOf(superClass), propName)
		}
	}else {
		result = true
	}
	return result
}

// copy methods from super classes
function copyMethodes(superClass: any, options: Vue.ComponentOptions<Vue>) {
	if (!(superClass === Vue.prototype)) {
		let superSuper = Object.getPrototypeOf(superClass)
		copyMethodes(superSuper, options)
		for (let n of Object.getOwnPropertyNames(superClass)) {
			if (n === 'constructor' || n === '$$vueTypescriptComponentData') {
				continue
			}
			const pd = Object.getOwnPropertyDescriptor(superClass, n)
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
	}
}

// copy props from super classes
function copyProps(superClass: any, options: Vue.ComponentOptions<Vue>) {
	if (!(superClass === Vue.prototype)) {
		let superSuper = Object.getPrototypeOf(superClass)
		copyProps(superSuper, options)
		let props = <{ [key: string]: Vue.PropOptions }>options.props
		let superProps = <{ [key: string]: Vue.PropOptions }>superClass.$$vueTypescriptComponentData.props || {}
		for (let n of Object.getOwnPropertyNames(superProps)) {
			props[n] = superProps[n] || {}
		}
	}
}

function copyWatches(superClass: any, options: Vue.ComponentOptions<Vue>) {
	if (!(superClass === Vue.prototype)) {
		let superSuper = Object.getPrototypeOf(superClass)
		copyWatches(superSuper, options)
		// let watch = <{ [key: string]: any }> options.watch
		let superWatch = <{ [key: string]: ({ handler: Vue.WatchHandler<Vue>; } & WatchOptions) |
			Vue.WatchHandler<Vue>; }>superClass.$$vueTypescriptComponentData.watch || {}
		for (let n of Object.getOwnPropertyNames(superWatch)) {
			let ws: WatchOptions = (<any>superWatch)[n][0]
			options.watch![ws.expression] = ws.options
		}
	}
}
