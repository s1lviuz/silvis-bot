module.exports = {
	extends: "eslint:recommended",
	env: {
		node: true,
		es6: true,
		es2021: true
	},
	parserOptions: {
		ecmaVersion: 2021,
		sourceType: 'module'
	},
	plugins: ['@typescript-eslint'],
	rules: {

	}
}