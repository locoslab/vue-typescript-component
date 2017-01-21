/// <reference path='../node_modules/@types/jest/index.d.ts' />

import * as vts from '../src/vue-typescript-component'

@vts.component
class Root {
}

@vts.component
class Empty extends Root {
}

@vts.component
class EmptyEmpty extends Empty {
}

@vts.component
class EmptyFull extends Empty {
	bData = 'abc'

	@vts.prop bProp = 'abc'

	get bComputedProp(): string { return this.bData }
	set bComputedProp(value: string) { this.bData = value }

	bMethod() { return 'bMethod' }

	// a lifecycle hook
	created() { /* do nothing */ }

	@vts.watch('bData') bWatch(val: string, oldVal: string) { /* do nothing */ }
}

@vts.component
class Full extends Root {
	aData = 'abc'

	@vts.prop aProp = 'abc'

	get aComputedProp(): string { return this.aData }
	set aComputedProp(value: string) { this.aData = value }

	aMethod() { return 'aMethod' }

	// a lifecycle hook
	created() { /* do nothing */ }

	@vts.watch('aData') aWatch(val: string, oldVal: string) { /* do nothing */ }
}

@vts.component
class FullEmpty extends Full {
}

@vts.component
class FullFull extends Full {
	bData = 'abc'

	@vts.prop bProp = 'abc'

	get bComputedProp(): string { return this.bData }
	set bComputedProp(value: string) { this.bData = value }

	bMethod() { return 'bMethod' }

	// a lifecycle hook
	mounted() { /* do nothing */ }

	@vts.watch('bData') bWatch(val: string, oldVal: string) { /* do nothing */ }
}

@vts.component
class FullOverride extends Full {
	aData = '123'
	bData = 'abc'

	@vts.prop aProp = '123'

	get aComputedProp(): string { return this.bData }
	set aComputedProp(value: string) { this.bData = value }

	aMethod() { return 'overridden aMethod' }

	// a lifecycle hook
	created() { /* do nothing */ }

	@vts.watch('aData') aWatch(val: string, oldVal: string) { /* do nothing */ }
}

it('Root options are correct', () => {
	expect((<any>Root).vueComponentOptions).toMatchSnapshot()
})
it('Root data is correct', () => {
	expect((<any>Root).vueComponentOptions.data()).toMatchSnapshot()
})

it('Empty options are correct', () => {
	expect((<any>Empty).vueComponentOptions).toMatchSnapshot()
})
it('Empty data is correct', () => {
	expect((<any>Empty).vueComponentOptions.data()).toMatchSnapshot()
})

it('EmptyEmpty options are correct', () => {
	expect((<any>EmptyEmpty).vueComponentOptions).toMatchSnapshot()
})
it('EmptyEmpty data is correct', () => {
	expect((<any>EmptyEmpty).vueComponentOptions.data()).toMatchSnapshot()
})

it('EmptyFull options are correct', () => {
	expect((<any>EmptyFull).vueComponentOptions).toMatchSnapshot()
})
it('EmptyFull data is correct', () => {
	expect((<any>EmptyFull).vueComponentOptions.data()).toMatchSnapshot()
})

it('Full options are correct', () => {
	expect((<any>Full).vueComponentOptions).toMatchSnapshot()
})
it('Full data is correct', () => {
	expect((<any>Full).vueComponentOptions.data()).toMatchSnapshot()
})

it('FullEmpty options are correct', () => {
	expect((<any>FullEmpty).vueComponentOptions).toMatchSnapshot()
})
it('FullEmpty data is correct', () => {
	expect((<any>FullEmpty).vueComponentOptions.data()).toMatchSnapshot()
})

it('FullFull options are correct', () => {
	expect((<any>FullFull).vueComponentOptions).toMatchSnapshot()
})
it('FullFull data is correct', () => {
	expect((<any>FullFull).vueComponentOptions.data()).toMatchSnapshot()
})

it('FullOverride options are correct', () => {
	expect((<any>FullOverride).vueComponentOptions).toMatchSnapshot()
})
it('FullOverride data is correct', () => {
	expect((<any>FullOverride).vueComponentOptions.data()).toMatchSnapshot()
})
