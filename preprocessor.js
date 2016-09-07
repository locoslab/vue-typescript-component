const tsc = require('typescript')
const tscOptions = require('./tsconfig.json')['compilerOptions']

module.exports = {
	process(src, path) {
		if (path.endsWith('.ts')) {
			return tsc.transpile(src, tscOptions, path, [])
		}
		return src
	},
}
